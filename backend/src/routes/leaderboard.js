// leaderboard.js — Public leaderboard route.
// Returns the top 10 players sorted by their best score using the v_leaderboard view.

import { Router } from 'express';
import pool from '../../database.js';

const router = Router();

// GET /leaderboard — Returns the top 10 players by best score.
// No input required. Returns an array of { username, best_score, total_runs, victories } objects.
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT username, best_score, total_runs, victories FROM v_leaderboard ORDER BY best_score DESC LIMIT 10'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
