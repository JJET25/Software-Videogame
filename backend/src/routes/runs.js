import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// POST /runs  — start a new run
router.post('/', requireAuth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO runs (user_id) VALUES (?)',
            [req.user.id]
        );
        res.status(201).json({ runId: result.insertId });
    } catch {
        res.status(500).json({ error: 'Failed to create run' });
    }
});

// PATCH /runs/:id  — update mid-run stats
router.patch('/:id', requireAuth, async (req, res) => {
    const allowed = ['rooms_cleared', 'enemies_killed', 'damage_dealt', 'damage_taken', 'credits_earned', 'cards_collected'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    if (!Object.keys(updates).length) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    try {
        const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values     = [...Object.values(updates), req.params.id, req.user.id];
        const [result] = await pool.query(
            `UPDATE runs SET ${setClauses} WHERE id = ? AND user_id = ?`,
            values
        );
        if (!result.affectedRows) return res.status(404).json({ error: 'Run not found' });
        res.json({ updated: true });
    } catch {
        res.status(500).json({ error: 'Failed to update run' });
    }
});

// POST /runs/:id/end  — finalise the run, record deck snapshot, compute score
router.post('/:id/end', requireAuth, async (req, res) => {
    const { status, cardIds = [], rooms_cleared, enemies_killed, damage_dealt, damage_taken, credits_earned, cards_collected } = req.body;

    if (!['victory', 'defeat'].includes(status)) {
        return res.status(400).json({ error: 'status must be "victory" or "defeat"' });
    }
    try {
        const score = computeScore({ status, rooms_cleared, enemies_killed, damage_dealt });

        await pool.query(
            `UPDATE runs
            SET status = ?, ended_at = NOW(), score = ?,
                rooms_cleared = COALESCE(?, rooms_cleared),
                enemies_killed = COALESCE(?, enemies_killed),
                damage_dealt = COALESCE(?, damage_dealt),
                damage_taken = COALESCE(?, damage_taken),
                credits_earned = COALESCE(?, credits_earned),
                cards_collected = COALESCE(?, cards_collected)
            WHERE id = ? AND user_id = ?`,
            [status, score,
            rooms_cleared ?? null, enemies_killed ?? null, damage_dealt ?? null,
            damage_taken ?? null, credits_earned ?? null, cards_collected ?? null,
            req.params.id, req.user.id]
        );

        if (cardIds.length) {
            const rows = cardIds.map(cid => [req.params.id, cid]);
            await pool.query('INSERT IGNORE INTO run_cards (run_id, card_id) VALUES ?', [rows]);
        }

        res.json({ score });
    } catch (err) {
        console.error('POST /runs/:id/end error:', err.message);
        res.status(500).json({ error: 'Failed to end run' });
    }
});

function computeScore({ status, rooms_cleared = 0, enemies_killed = 0, damage_dealt = 0 }) {
    const base    = status === 'victory' ? 1000 : 0;
    const roomPts = rooms_cleared * 50;
    const killPts = enemies_killed * 20;
    const dmgPts  = Math.floor(damage_dealt / 10);
    return base + roomPts + killPts + dmgPts;
}

export default router;
