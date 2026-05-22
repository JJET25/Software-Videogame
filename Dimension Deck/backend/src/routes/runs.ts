import { Router } from 'express';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { query, execute, transaction, getPool } from '../db';
import { requireAuth, JwtPayload } from '../middleware/auth';

const router = Router();

// POST /runs — start a new run
router.post('/', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const { seed, startingDimensionId } = req.body as { seed?: string; startingDimensionId?: number };
  const dimId = startingDimensionId ?? 1;

  const runId = await transaction(async (conn: PoolConnection) => {
    const [runResult] = await conn.execute<import('mysql2').ResultSetHeader>(
      'INSERT INTO run (player_id, starting_dimension_id, current_dimension_id, seed) VALUES (?, ?, ?, ?)',
      [playerId, dimId, dimId, seed ?? null]
    );
    const id = runResult.insertId;

    await conn.execute(
      `INSERT INTO run_deck_card (run_id, card_id, card_level, acquired_from, room_number_acquired)
       SELECT ?, card_id, 'base', 'starter', 0 FROM card WHERE name = 'Quick Strike' LIMIT 1`,
      [id]
    );
    await conn.execute(
      'UPDATE player SET total_runs = total_runs + 1 WHERE player_id = ?',
      [playerId]
    );
    return id;
  });

  const [run] = await query<RowDataPacket>('SELECT * FROM v_run_overview WHERE run_id = ?', [runId]);
  res.status(201).json(run);
});

// POST /runs/:runId/rooms — register room entry
router.post('/:runId/rooms', requireAuth, async (req, res) => {
  const { dimensionId, roomNumber, roomType } = req.body as {
    dimensionId: number;
    roomNumber: number;
    roomType: 'combat' | 'chest' | 'shop' | 'shrine' | 'glitch' | 'boss';
  };
  const result = await execute(
    'INSERT INTO run_room (run_id, dimension_id, room_number, room_type) VALUES (?, ?, ?, ?)',
    [req.params.runId, dimensionId, roomNumber, roomType]
  );
  const [room] = await query<RowDataPacket>(
    'SELECT * FROM v_room_state WHERE run_room_id = ?',
    [result.insertId]
  );
  res.status(201).json(room);
});

// PUT /runs/:runId/rooms/:roomId/clear — mark room cleared and add credits
router.put('/:runId/rooms/:roomId/clear', requireAuth, async (req, res) => {
  const { creditsEarned, timeSpentSec } = req.body as {
    creditsEarned?: number;
    timeSpentSec?: number;
  };
  await execute(
    'UPDATE run_room SET cleared = 1, cleared_at = NOW(), time_spent_sec = ? WHERE run_room_id = ? AND run_id = ?',
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

// GET /runs/:runId/deck — active deck (tab screen)
router.get('/:runId/deck', requireAuth, async (req, res) => {
  const deck = await query<RowDataPacket>(
    'SELECT * FROM v_active_deck WHERE run_id = ?',
    [req.params.runId]
  );
  res.json(deck);
});

// POST /runs/:runId/deck/cards — add card with auto-merge logic
router.post('/:runId/deck/cards', requireAuth, async (req, res) => {
  const { cardId, acquiredFrom, roomNumberAcquired } = req.body as {
    cardId: number;
    acquiredFrom: 'chest' | 'shop' | 'boss_reward' | 'glitch_pillar';
    roomNumberAcquired: number;
  };

  const [existing] = await query<RowDataPacket>(
    `SELECT run_deck_card_id, card_level FROM run_deck_card
     WHERE run_id = ? AND card_id = ? AND discarded = 0
     ORDER BY run_deck_card_id ASC LIMIT 1`,
    [req.params.runId, cardId]
  );

  const levelMap: Record<string, string> = { base: 'upgraded', upgraded: 'max' };

  if (existing && existing.card_level !== 'max') {
    await execute(
      'UPDATE run_deck_card SET card_level = ? WHERE run_deck_card_id = ?',
      [levelMap[existing.card_level], existing.run_deck_card_id]
    );
    res.json({ merged: true, newLevel: levelMap[existing.card_level] });
  } else if (existing && existing.card_level === 'max') {
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
      'INSERT INTO run_deck_card (run_id, card_id, acquired_from, room_number_acquired) VALUES (?, ?, ?, ?)',
      [req.params.runId, cardId, acquiredFrom, roomNumberAcquired]
    );
    res.status(201).json({ runDeckCardId: result.insertId, merged: false });
  }
});

// DELETE /runs/:runId/deck/cards/:runDeckCardId — discard a card (shop removal service)
router.delete('/:runId/deck/cards/:runDeckCardId', requireAuth, async (req, res) => {
  const { roomNumberDiscarded } = req.body as { roomNumberDiscarded?: number };
  await execute(
    'UPDATE run_deck_card SET discarded = 1, room_number_discarded = ? WHERE run_deck_card_id = ? AND run_id = ?',
    [roomNumberDiscarded ?? null, req.params.runDeckCardId, req.params.runId]
  );
  res.json({ discarded: true });
});

// GET /runs/:runId/rooms/:roomId/shop — shop inventory
router.get('/:runId/rooms/:roomId/shop', requireAuth, async (req, res) => {
  const items = await query<RowDataPacket>(
    'SELECT * FROM v_shop_inventory WHERE run_room_id = ?',
    [req.params.roomId]
  );
  res.json(items);
});

// POST /runs/:runId/shop/buy — buy a card from the shop
router.post('/:runId/shop/buy', requireAuth, async (req, res) => {
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

// POST /runs/:runId/dimension/next — advance to next dimension
router.post('/:runId/dimension/next', requireAuth, async (req, res) => {
  const [current] = await query<RowDataPacket>(
    'SELECT current_dimension_id FROM run WHERE run_id = ?',
    [req.params.runId]
  );
  const [next] = await query<RowDataPacket>(
    `SELECT dimension_id FROM dimension
     WHERE order_in_run > (SELECT order_in_run FROM dimension WHERE dimension_id = ?)
     ORDER BY order_in_run ASC LIMIT 1`,
    [current?.current_dimension_id]
  );
  if (!next) { res.status(400).json({ error: 'No next dimension' }); return; }

  await execute(
    'UPDATE run SET current_dimension_id = ?, current_room_number = 1 WHERE run_id = ?',
    [next.dimension_id, req.params.runId]
  );
  res.json({ nextDimensionId: next.dimension_id });
});

// POST /runs/:runId/end — end run (victory or defeat), transfer credits to hub
router.post('/:runId/end', requireAuth, async (req, res) => {
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
      'UPDATE run SET outcome = ?, death_room_number = ?, ended_at = NOW() WHERE run_id = ?',
      [outcome, deathRoomNumber ?? null, req.params.runId]
    );
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

export default router;
