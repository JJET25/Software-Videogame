import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getPool, pingDatabase, printSchema, query, execute, transaction } from './db';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app  = express();
const PORT = Number(process.env.PORT ?? 3001);
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

app.use(cors());
app.use(express.json());

// ─── Auth middleware ──────────────────────────────────────────────────────────

interface JwtPayload { playerId: number; username: string; }

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    (req as any).player = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH & SCHEMA REFLECTION
// ─────────────────────────────────────────────────────────────────────────────

/** GET /health — DB ping + basic server info */
app.get('/health', async (_req, res) => {
  const db = await pingDatabase();
  res.json({ server: 'ok', db });
});

/** GET /schema — live schema dump (dev only; remove or gate in production) */
app.get('/schema', async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Disabled in production' });
    return;
  }
  const { reflectSchema } = await import('./db');
  const schema = await reflectSchema();
  res.json(schema);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 1 — AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

/** POST /auth/register — create a new player account */
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body as Record<string, string>;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await execute(
      'INSERT INTO player (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    const token = jwt.sign({ playerId: result.insertId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ playerId: result.insertId, username, token });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Username or email already taken' });
    } else {
      throw err;
    }
  }
});

/** POST /auth/login */
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body as Record<string, string>;
  const [player] = await query<RowDataPacket>(
    'SELECT player_id, username, password_hash FROM player WHERE username = ?',
    [username]
  );
  if (!player || !(await bcrypt.compare(password, player.password_hash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign({ playerId: player.player_id, username: player.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ playerId: player.player_id, username: player.username, token });
});

/** GET /auth/me — player profile from v_player_profile */
app.get('/auth/me', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const [profile] = await query<RowDataPacket>(
    'SELECT * FROM v_player_profile WHERE player_id = ?',
    [playerId]
  );
  if (!profile) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json(profile);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 2 — RUN INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/** POST /runs — start a new roguelite run */
app.post('/runs', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const { seed, startingDimensionId } = req.body as { seed?: string; startingDimensionId?: number };
  const dimId = startingDimensionId ?? 1;

  const runId = await transaction(async (conn: PoolConnection) => {
    const [runResult] = await conn.execute<import('mysql2').ResultSetHeader>(
      `INSERT INTO run (player_id, starting_dimension_id, current_dimension_id, seed)
       VALUES (?, ?, ?, ?)`,
      [playerId, dimId, dimId, seed ?? null]
    );
    const id = runResult.insertId;

    // Insert starter deck (3 Quick Strike cards at base level)
    await conn.execute(
      `INSERT INTO run_deck_card (run_id, card_id, card_level, acquired_from, room_number_acquired)
       SELECT ?, card_id, 'base', 'starter', 0 FROM card WHERE name = 'Quick Strike' LIMIT 3`,
      [id]
    );

    // Increment player run counter
    await conn.execute(
      'UPDATE player SET total_runs = total_runs + 1 WHERE player_id = ?',
      [playerId]
    );

    return id;
  });

  const [run] = await query<RowDataPacket>('SELECT * FROM v_run_overview WHERE run_id = ?', [runId]);
  res.status(201).json(run);
});

/** GET /runs/:runId — run state overview */
app.get('/runs/:runId', requireAuth, async (req, res) => {
  const [run] = await query<RowDataPacket>(
    'SELECT * FROM v_run_overview WHERE run_id = ?',
    [req.params.runId]
  );
  if (!run) { res.status(404).json({ error: 'Run not found' }); return; }
  res.json(run);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 3 — ROOM ENTRY & STATE
// ─────────────────────────────────────────────────────────────────────────────

/** POST /runs/:runId/rooms — create a new room entry for this run */
app.post('/runs/:runId/rooms', requireAuth, async (req, res) => {
  const { dimensionId, roomNumber, roomType } = req.body as {
    dimensionId: number;
    roomNumber: number;
    roomType: 'combat' | 'chest' | 'shop' | 'shrine' | 'glitch' | 'boss';
  };
  const result = await execute(
    `INSERT INTO run_room (run_id, dimension_id, room_number, room_type) VALUES (?, ?, ?, ?)`,
    [req.params.runId, dimensionId, roomNumber, roomType]
  );
  const [room] = await query<RowDataPacket>(
    'SELECT * FROM v_room_state WHERE run_room_id = ?',
    [result.insertId]
  );
  res.status(201).json(room);
});

/** GET /runs/:runId/rooms/:roomId — room state */
app.get('/runs/:runId/rooms/:roomId', requireAuth, async (req, res) => {
  const [room] = await query<RowDataPacket>(
    'SELECT * FROM v_room_state WHERE run_room_id = ? AND run_id = ?',
    [req.params.roomId, req.params.runId]
  );
  if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
  res.json(room);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 4 — COMBAT TELEMETRY
// ─────────────────────────────────────────────────────────────────────────────

/** POST /runs/:runId/events/card-use — log a card being played */
app.post('/runs/:runId/events/card-use', requireAuth, async (req, res) => {
  const { runRoomId, cardId, resultedInSynergy } = req.body as {
    runRoomId: number;
    cardId: number;
    resultedInSynergy?: boolean;
  };
  const result = await execute(
    `INSERT INTO card_usage_event (run_id, run_room_id, card_id, resulted_in_synergy) VALUES (?, ?, ?, ?)`,
    [req.params.runId, runRoomId, cardId, resultedInSynergy ? 1 : 0]
  );
  res.status(201).json({ eventId: result.insertId });
});

/** POST /runs/:runId/events/synergy — log a synergy trigger */
app.post('/runs/:runId/events/synergy', requireAuth, async (req, res) => {
  const { runRoomId, synergyId } = req.body as { runRoomId: number; synergyId: number };
  const result = await execute(
    `INSERT INTO synergy_trigger_event (run_id, run_room_id, synergy_id) VALUES (?, ?, ?)`,
    [req.params.runId, runRoomId, synergyId]
  );
  res.status(201).json({ eventId: result.insertId });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 5 — ROOM CLEAR & CARD REWARDS
// ─────────────────────────────────────────────────────────────────────────────

/** PUT /runs/:runId/rooms/:roomId/clear — mark room cleared, award credits */
app.put('/runs/:runId/rooms/:roomId/clear', requireAuth, async (req, res) => {
  const { creditsEarned, timeSpentSec } = req.body as {
    creditsEarned?: number;
    timeSpentSec?: number;
  };
  await execute(
    `UPDATE run_room SET cleared = 1, cleared_at = NOW(), time_spent_sec = ? WHERE run_room_id = ? AND run_id = ?`,
    [timeSpentSec ?? null, req.params.roomId, req.params.runId]
  );
  if (creditsEarned) {
    await execute(
      'UPDATE run SET total_credits_earned = total_credits_earned + ? WHERE run_id = ?',
      [creditsEarned, req.params.runId]
    );
  }
  res.json({ cleared: true });
});

/** POST /runs/:runId/deck/cards — add a card to the run deck */
app.post('/runs/:runId/deck/cards', requireAuth, async (req, res) => {
  const { cardId, acquiredFrom, roomNumberAcquired } = req.body as {
    cardId: number;
    acquiredFrom: 'chest' | 'shop' | 'boss_reward' | 'glitch_pillar';
    roomNumberAcquired: number;
  };

  // Auto-merge: count non-discarded copies already in deck
  const [existing] = await query<RowDataPacket>(
    `SELECT run_deck_card_id, card_level FROM run_deck_card
     WHERE run_id = ? AND card_id = ? AND discarded = 0
     ORDER BY run_deck_card_id ASC LIMIT 1`,
    [req.params.runId, cardId]
  );

  const levelMap: Record<string, string> = { base: 'upgraded', upgraded: 'max' };

  if (existing && existing.card_level !== 'max') {
    // Merge: upgrade existing, don't insert a new row
    await execute(
      'UPDATE run_deck_card SET card_level = ? WHERE run_deck_card_id = ?',
      [levelMap[existing.card_level], existing.run_deck_card_id]
    );
    res.json({ merged: true, newLevel: levelMap[existing.card_level] });
  } else if (existing && existing.card_level === 'max') {
    // Already max — convert to credits
    const [[cardInfo]] = await getPool().execute<RowDataPacket[]>(
      'SELECT rarity FROM card WHERE card_id = ?', [cardId]
    );
    const creditMap: Record<string, number> = { common: 10, rare: 25, epic: 50, legendary: 100 };
    const credits = creditMap[cardInfo?.rarity] ?? 10;
    await execute(
      'UPDATE run SET total_credits_earned = total_credits_earned + ? WHERE run_id = ?',
      [credits, req.params.runId]
    );
    res.json({ merged: false, convertedToCredits: credits });
  } else {
    const result = await execute(
      `INSERT INTO run_deck_card (run_id, card_id, acquired_from, room_number_acquired) VALUES (?, ?, ?, ?)`,
      [req.params.runId, cardId, acquiredFrom, roomNumberAcquired]
    );
    res.status(201).json({ runDeckCardId: result.insertId, merged: false });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 6 — SHOP
// ─────────────────────────────────────────────────────────────────────────────

/** GET /runs/:runId/rooms/:roomId/shop — shop inventory from v_shop_inventory */
app.get('/runs/:runId/rooms/:roomId/shop', requireAuth, async (req, res) => {
  const items = await query<RowDataPacket>(
    'SELECT * FROM v_shop_inventory WHERE run_room_id = ?',
    [req.params.roomId]
  );
  res.json(items);
});

/** POST /runs/:runId/shop/buy — purchase a card from the shop */
app.post('/runs/:runId/shop/buy', requireAuth, async (req, res) => {
  const { shopInventoryId } = req.body as { shopInventoryId: number };
  const [item] = await query<RowDataPacket>(
    'SELECT * FROM v_shop_inventory WHERE shop_inventory_id = ? AND sold = 0',
    [shopInventoryId]
  );
  if (!item) { res.status(404).json({ error: 'Item not available' }); return; }

  await transaction(async (conn) => {
    await conn.execute(
      'UPDATE shop_inventory SET sold = 1 WHERE shop_inventory_id = ?',
      [shopInventoryId]
    );
    await conn.execute(
      'UPDATE run SET total_credits_earned = total_credits_earned - ? WHERE run_id = ?',
      [item.price, req.params.runId]
    );
    await conn.execute(
      `INSERT INTO run_deck_card (run_id, card_id, acquired_from, room_number_acquired)
       VALUES (?, ?, 'shop', (SELECT current_room_number FROM run WHERE run_id = ?))`,
      [req.params.runId, item.card_id, req.params.runId]
    );
  });

  res.json({ purchased: true, cardId: item.card_id });
});

/** DELETE /runs/:runId/deck/cards/:runDeckCardId — discard (remove) a card */
app.delete('/runs/:runId/deck/cards/:runDeckCardId', requireAuth, async (req, res) => {
  const { roomNumberDiscarded } = req.body as { roomNumberDiscarded?: number };
  await execute(
    'UPDATE run_deck_card SET discarded = 1, room_number_discarded = ? WHERE run_deck_card_id = ? AND run_id = ?',
    [roomNumberDiscarded ?? null, req.params.runDeckCardId, req.params.runId]
  );
  res.json({ discarded: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 7 — DECK MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/** GET /runs/:runId/deck — active deck from v_active_deck */
app.get('/runs/:runId/deck', requireAuth, async (req, res) => {
  const deck = await query<RowDataPacket>(
    'SELECT * FROM v_active_deck WHERE run_id = ?',
    [req.params.runId]
  );
  res.json(deck);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 8 — DIMENSION TRANSITION
// ─────────────────────────────────────────────────────────────────────────────

/** POST /runs/:runId/dimension/next — advance to next dimension */
app.post('/runs/:runId/dimension/next', requireAuth, async (req, res) => {
  const [current] = await query<RowDataPacket>(
    'SELECT current_dimension_id FROM run WHERE run_id = ?',
    [req.params.runId]
  );
  const [next] = await query<RowDataPacket>(
    'SELECT dimension_id FROM dimension WHERE order_in_run > (SELECT order_in_run FROM dimension WHERE dimension_id = ?) ORDER BY order_in_run ASC LIMIT 1',
    [current?.current_dimension_id]
  );
  if (!next) { res.status(400).json({ error: 'No next dimension — final boss awaits' }); return; }
  await execute(
    'UPDATE run SET current_dimension_id = ?, current_room_number = 1 WHERE run_id = ?',
    [next.dimension_id, req.params.runId]
  );
  res.json({ nextDimensionId: next.dimension_id });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 9 — RUN END (VICTORY / DEFEAT)
// ─────────────────────────────────────────────────────────────────────────────

/** POST /runs/:runId/end — finalise a run and transfer credits to hub */
app.post('/runs/:runId/end', requireAuth, async (req, res) => {
  const { outcome, deathRoomNumber } = req.body as {
    outcome: 'victory' | 'defeat';
    deathRoomNumber?: number;
  };
  const { playerId } = (req as any).player as JwtPayload;

  const [run] = await query<RowDataPacket>(
    'SELECT total_credits_earned FROM run WHERE run_id = ? AND outcome = "in_progress"',
    [req.params.runId]
  );
  if (!run) { res.status(404).json({ error: 'Active run not found' }); return; }

  await transaction(async (conn) => {
    await conn.execute(
      `UPDATE run SET outcome = ?, death_room_number = ?, ended_at = NOW() WHERE run_id = ?`,
      [outcome, deathRoomNumber ?? null, req.params.runId]
    );
    // Carry earned credits over to the hub
    await conn.execute(
      'UPDATE player SET hub_credits = hub_credits + ? WHERE player_id = ?',
      [run.total_credits_earned, playerId]
    );
    if (outcome === 'victory') {
      await conn.execute(
        'UPDATE player SET total_victories = total_victories + 1 WHERE player_id = ?',
        [playerId]
      );
    }
  });

  const [summary] = await query<RowDataPacket>(
    'SELECT * FROM v_run_overview WHERE run_id = ?',
    [req.params.runId]
  );
  res.json(summary);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS 10 — HUB WORLD UPGRADES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /hub/upgrades — upgrade shop with player purchase status */
app.get('/hub/upgrades', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const upgrades = await query<RowDataPacket>(
    'SELECT * FROM v_hub_upgrade_status WHERE player_id = ? OR player_id IS NULL',
    [playerId]
  );
  res.json(upgrades);
});

/** POST /hub/upgrades/:upgradeId/purchase */
app.post('/hub/upgrades/:upgradeId/purchase', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const upgradeId = Number(req.params.upgradeId);

  const [upgrade] = await query<RowDataPacket>(
    'SELECT * FROM hub_upgrade WHERE upgrade_id = ?', [upgradeId]
  );
  if (!upgrade) { res.status(404).json({ error: 'Upgrade not found' }); return; }

  const [player] = await query<RowDataPacket>(
    'SELECT hub_credits FROM player WHERE player_id = ?', [playerId]
  );
  if (player.hub_credits < upgrade.credit_cost) {
    res.status(402).json({ error: 'Insufficient hub credits' });
    return;
  }

  await transaction(async (conn) => {
    await conn.execute(
      'INSERT INTO player_hub_upgrade (player_id, upgrade_id) VALUES (?, ?)',
      [playerId, upgradeId]
    );
    await conn.execute(
      'UPDATE player SET hub_credits = hub_credits - ? WHERE player_id = ?',
      [upgrade.credit_cost, playerId]
    );
  });

  res.json({ purchased: true, upgrade });
});

// ─────────────────────────────────────────────────────────────────────────────
// CARD CATALOG  (used by frontend card selection screens)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /cards — full catalog with synergy info */
app.get('/cards', async (_req, res) => {
  const cards = await query<RowDataPacket>('SELECT * FROM v_card_catalog');
  res.json(cards);
});

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY  (internal / analytics)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /telemetry/runs/:runId — per-run card usage from v_run_card_telemetry */
app.get('/telemetry/runs/:runId', requireAuth, async (req, res) => {
  const data = await query<RowDataPacket>(
    'SELECT * FROM v_run_card_telemetry WHERE run_id = ?',
    [req.params.runId]
  );
  res.json(data);
});

/** GET /telemetry/kpis — the three GDD-defined KPIs aggregated across all runs */
app.get('/telemetry/kpis', async (_req, res) => {
  const [avgTimePerDim] = await query<RowDataPacket>(`
    SELECT d.name AS dimension,
           ROUND(AVG(TIMESTAMPDIFF(SECOND, r.started_at, COALESCE(r.ended_at, NOW()))) / 60, 1) AS avg_minutes
    FROM run r
    JOIN dimension d ON d.dimension_id = r.current_dimension_id
    WHERE r.outcome != 'in_progress'
    GROUP BY d.name
  `);

  const [mostDiscarded] = await query<RowDataPacket>(`
    SELECT c.name AS card_name, COUNT(*) AS times_discarded
    FROM run_deck_card rdc
    JOIN card c ON c.card_id = rdc.card_id
    WHERE rdc.discarded = 1 AND rdc.acquired_from != 'starter'
    GROUP BY c.card_id ORDER BY times_discarded DESC LIMIT 1
  `);

  const [deathRoomDist] = await query<RowDataPacket>(`
    SELECT death_room_number, COUNT(*) AS deaths
    FROM run
    WHERE outcome = 'defeat' AND death_room_number IS NOT NULL
    GROUP BY death_room_number
    ORDER BY deaths DESC LIMIT 5
  `);

  res.json({ avgTimePerDimension: avgTimePerDim, mostDiscardedCard: mostDiscarded, deathRoomDistribution: deathRoomDist });
});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─────────────────────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────────────────────

async function start() {
  const { ok, latencyMs } = await pingDatabase();
  if (!ok) {
    console.error('Cannot connect to MySQL — check .env and that the DB server is running.');
    process.exit(1);
  }
  console.log(`DB connected (${latencyMs}ms)`);

  if (process.env.PRINT_SCHEMA === 'true') {
    await printSchema();
  }

  app.listen(PORT, () => console.log(`Dimension Deck API listening on http://localhost:${PORT}`));
}

start().catch(console.error);
