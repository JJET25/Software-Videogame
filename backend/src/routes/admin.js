import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();

// GET /admin/players — all non-admin players with their summary stats
router.get('/players', requireAuth, requireAdmin, async (_req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.username, u.created_at,
                   COALESCE(s.total_runs, 0)           AS total_runs,
                   COALESCE(s.victories, 0)            AS victories,
                   COALESCE(s.defeats, 0)              AS defeats,
                   COALESCE(s.win_rate_pct, 0)         AS win_rate_pct,
                   COALESCE(s.best_score, 0)           AS best_score,
                   COALESCE(s.avg_score, 0)            AS avg_score,
                   COALESCE(s.avg_enemies_per_run, 0)  AS avg_enemies_per_run,
                   COALESCE(s.avg_rooms_per_run, 0)    AS avg_rooms_per_run,
                   COALESCE(s.total_damage_dealt, 0)   AS total_damage_dealt,
                   COALESCE(s.total_damage_taken, 0)   AS total_damage_taken
            FROM users u
            LEFT JOIN v_user_run_summary s ON u.id = s.user_id
            WHERE u.is_admin = 0
            ORDER BY best_score DESC
        `);
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// GET /admin/averages — global averages across all non-admin players
router.get('/averages', requireAuth, requireAdmin, async (_req, res) => {
    try {
        const [[avgs]] = await pool.query(`
            SELECT
                COUNT(u.id)                                  AS total_players,
                AVG(COALESCE(s.total_runs, 0))               AS avg_runs_per_player,
                AVG(COALESCE(s.victories, 0))                AS avg_victories_per_player,
                AVG(COALESCE(s.win_rate_pct, 0))             AS avg_win_rate,
                AVG(COALESCE(s.best_score, 0))               AS avg_best_score,
                AVG(COALESCE(s.avg_score, 0))                AS avg_score_overall,
                AVG(COALESCE(s.avg_enemies_per_run, 0))      AS avg_kills_per_run,
                AVG(COALESCE(s.avg_rooms_per_run, 0))        AS avg_rooms_per_run,
                AVG(COALESCE(s.total_damage_dealt, 0))       AS avg_damage_dealt,
                AVG(COALESCE(s.total_damage_taken, 0))       AS avg_damage_taken
            FROM users u
            LEFT JOIN v_user_run_summary s ON u.id = s.user_id
            WHERE u.is_admin = 0
        `);
        res.json(avgs ?? {});
    } catch {
        res.status(500).json({ error: 'Failed to fetch averages' });
    }
});

export default router;
