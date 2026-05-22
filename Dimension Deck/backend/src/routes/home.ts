import { Router } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { query, execute } from '../db';
import { requireAuth, JwtPayload } from '../middleware/auth';

const router = Router();

// GET /home — single call that populates the entire home screen
router.get('/home', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;

  const [profile] = await query<RowDataPacket>(
    'SELECT player_id, username, hub_credits, total_runs, total_victories, tutorial_completed FROM player WHERE player_id = ?',
    [playerId]
  );
  const [activeRun] = await query<RowDataPacket>(
    'SELECT run_id, current_dimension, current_room_number, started_at FROM v_run_overview WHERE player_id = ? AND outcome = "in_progress" LIMIT 1',
    [playerId]
  );

  // activeRun = null  →  show "New Game"
  // activeRun = {...} →  show "Continue"
  res.json({ player: profile, activeRun: activeRun ?? null });
});

// GET /settings — load player preferences
router.get('/settings', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const [settings] = await query<RowDataPacket>(
    'SELECT * FROM player_settings WHERE player_id = ?',
    [playerId]
  );
  res.json(settings ?? { player_id: playerId, music_volume: 80, sfx_volume: 80, fullscreen: 0, language: 'en' });
});

// PUT /settings — save player preferences
router.put('/settings', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const { music_volume, sfx_volume, fullscreen, language } = req.body as {
    music_volume?: number;
    sfx_volume?:  number;
    fullscreen?:  boolean;
    language?:    string;
  };
  await execute(
    `INSERT INTO player_settings (player_id, music_volume, sfx_volume, fullscreen, language)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       music_volume = VALUES(music_volume),
       sfx_volume   = VALUES(sfx_volume),
       fullscreen   = VALUES(fullscreen),
       language     = VALUES(language)`,
    [playerId, music_volume ?? 80, sfx_volume ?? 80, fullscreen ? 1 : 0, language ?? 'en']
  );
  res.json({ saved: true });
});

// GET /statistics — stats screen (v_player_statistics view)
router.get('/statistics', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  const [stats] = await query<RowDataPacket>(
    'SELECT * FROM v_player_statistics WHERE player_id = ?',
    [playerId]
  );
  if (!stats) { res.status(404).json({ error: 'Player not found' }); return; }
  res.json(stats);
});

// PUT /tutorial/complete — mark tutorial as seen (called once after tutorial ends)
router.put('/tutorial/complete', requireAuth, async (req, res) => {
  const { playerId } = (req as any).player as JwtPayload;
  await execute(
    'UPDATE player SET tutorial_completed = 1 WHERE player_id = ?',
    [playerId]
  );
  res.json({ tutorial_completed: true });
});

export default router;
