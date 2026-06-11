// stats.js — Routes for player-specific and global game statistics.
// Personal routes require authentication; the global route is public.

import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// GET /stats/me/summary — Returns aggregate KPIs for the authenticated player.
// No input required. Uses v_user_run_summary; returns { total_runs: 0 } when no runs exist.
router.get('/me/summary', requireAuth, async (req, res) => {
  try {
    const [[summary]] = await pool.query(
      'SELECT * FROM v_user_run_summary WHERE user_id = ?',
      [req.user.id]
    );
    res.json(summary ?? { total_runs: 0 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /stats/me/cards — Returns the top 10 most collected cards for the authenticated player.
// No input required. Uses v_card_usage ordered by times_collected descending.
router.get('/me/cards', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT card_name, rarity, card_type, subtype, times_collected FROM v_card_usage WHERE user_id = ? ORDER BY times_collected DESC LIMIT 10',
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch card stats' });
  }
});

// GET /stats/me/runs — Returns the last 15 completed runs for the authenticated player, oldest first.
// No input required. Only includes runs with status "victory" or "defeat"; reversed for chart ordering.
router.get('/me/runs', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT score, status, rooms_cleared, enemies_killed, ended_at
       FROM runs
       WHERE user_id = ? AND status IN ('victory', 'defeat')
       ORDER BY ended_at DESC LIMIT 15`,
      [req.user.id]
    );
    res.json(rows.reverse());
  } catch {
    res.status(500).json({ error: 'Failed to fetch run history' });
  }
});

// GET /stats/global — Returns server-wide aggregate statistics and the top 5 most collected cards.
// No input required. Uses v_global_stats for the overview and v_top_cards for the card list.
router.get('/global', async (_req, res) => {
  try {
    const [[overview]] = await pool.query('SELECT * FROM v_global_stats');
    const [topCards]   = await pool.query(
      'SELECT card_name, rarity, card_type, times_collected FROM v_top_cards ORDER BY times_collected DESC LIMIT 5'
    );
    res.json({ overview, top_cards: topCards });
  } catch {
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
});

export default router;
