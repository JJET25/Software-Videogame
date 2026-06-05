import { Router } from 'express';
import pool from '../../database.js';

const router = Router();

// GET /leaderboard  — top 10 players by best score (uses v_leaderboard)
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
