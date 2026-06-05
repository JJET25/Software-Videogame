import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// GET /stats/me/summary  — aggregate KPIs for the logged-in player (uses v_user_run_summary)
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

// GET /stats/me/cards  — cards this player collects most (uses v_card_usage)
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

// GET /stats/global  — server-wide aggregates (uses v_global_stats + v_top_cards)
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
