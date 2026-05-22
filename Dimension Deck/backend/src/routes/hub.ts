import { Router } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { query, execute, transaction } from '../db';
import { requireAuth, JwtPayload } from '../middleware/auth';

const router = Router();

// GET /hub/upgrades — all upgrades with purchased status for the logged-in player
router.get('/upgrades', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const upgrades = await query<RowDataPacket>(
    'SELECT * FROM v_hub_upgrade_status WHERE player_id = ? OR player_id IS NULL',
    [playerId]
  );
  res.json(upgrades);
});

// POST /hub/upgrades/:upgradeId/purchase — buy a permanent upgrade
router.post('/upgrades/:upgradeId/purchase', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const upgradeId = Number(req.params.upgradeId);

  const [upgrade] = await query<RowDataPacket>(
    'SELECT * FROM hub_upgrade WHERE upgrade_id = ?',
    [upgradeId]
  );
  if (!upgrade) { res.status(404).json({ error: 'Upgrade not found' }); return; }

  const [player] = await query<RowDataPacket>(
    'SELECT hub_credits FROM player WHERE player_id = ?',
    [playerId]
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

export default router;
