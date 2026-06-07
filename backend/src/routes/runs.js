import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// POST /runs  — start a new run via sp_start_run
// The procedure triggers: cancel old active run + create run_player_state automatically
router.post('/', requireAuth, async (req, res) => {
    try {
        const [results] = await pool.query('CALL sp_start_run(?)', [req.user.id]);
        const runId = results[0][0].run_id;
        res.status(201).json({ runId });
    } catch (err) {
        console.error('POST /runs error:', err.message);
        res.status(500).json({ error: 'Failed to create run' });
    }
});

// PATCH /runs/:id  — update mid-run stats (rooms_cleared, enemies_killed, etc.)
router.patch('/:id', requireAuth, async (req, res) => {
    const allowed = ['rooms_cleared', 'enemies_killed', 'damage_dealt', 'damage_taken', 'credits_earned', 'cards_collected'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    if (!Object.keys(updates).length) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    try {
        const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values     = [...Object.values(updates), req.params.id, req.user.id];
        const [result]   = await pool.query(
            `UPDATE runs SET ${setClauses} WHERE id = ? AND user_id = ?`,
            values
        );
        if (!result.affectedRows) return res.status(404).json({ error: 'Run not found' });
        res.json({ updated: true });
    } catch (err) {
        console.error('PATCH /runs/:id error:', err.message);
        res.status(500).json({ error: 'Failed to update run' });
    }
});

// POST /runs/:id/end  — finalise run via sp_end_run (score computed server-side)
// cards_collected is managed by trg_cards_collected_count as run_cards are inserted
router.post('/:id/end', requireAuth, async (req, res) => {
    const {
        status,
        cardIds = [],
        rooms_cleared, enemies_killed,
        damage_dealt,  damage_taken,
        credits_earned,
    } = req.body;

    if (!['victory', 'defeat'].includes(status)) {
        return res.status(400).json({ error: 'status must be "victory" or "defeat"' });
    }
    try {
        const [results] = await pool.query(
            'CALL sp_end_run(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                req.params.id, req.user.id, status,
                rooms_cleared  ?? null,
                enemies_killed ?? null,
                damage_dealt   ?? null,
                damage_taken   ?? null,
                credits_earned ?? null,
            ]
        );

        const { score, affected } = results[0][0];
        if (!affected) return res.status(404).json({ error: 'Run not found or already finished' });

        // Batch-insert the final deck snapshot; trg_cards_collected_count handles the counter
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

export default router;
