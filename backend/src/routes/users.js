// users.js — Routes for the authenticated user's profile and run history.
// All routes require a valid JWT token.

import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// GET /users/me — Returns the authenticated user's profile data.
// No input required. Returns { id, username, email, is_admin, created_at }; 404 if the user no longer exists.
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.query(
      'SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /users/me/runs — Returns the last 50 runs for the authenticated user, newest first.
// No input required. Returns full run stats including score, status, and timestamps.
router.get('/me/runs', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status, score, rooms_cleared, enemies_killed,
              damage_dealt, damage_taken, credits_earned, cards_collected,
              started_at, ended_at
      FROM runs
      WHERE user_id = ?
      ORDER BY started_at DESC
      LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

export default router;
