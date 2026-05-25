import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();
const SHOP_SIZE = 5;

// GET /shop/offerings/:runId  — 5 random purchasable cards for this run
router.get('/offerings/:runId', requireAuth, async (req, res) => {
    try {
        // Exclude cards already in the player's deck this run
        const [owned] = await pool.query(
            'SELECT card_id FROM run_cards WHERE run_id = ?',
            [req.params.runId]
        );
        const ownedIds = owned.map(r => r.card_id);

        let query  = 'SELECT * FROM cards WHERE shop_cost > 0';
        const args = [];

        if (ownedIds.length) {
            query += ' AND id NOT IN (?)';
            args.push(ownedIds);
        }

        query += ' ORDER BY RAND() LIMIT ?';
        args.push(SHOP_SIZE);

        const [cards] = await pool.query(query, args);
        res.json(cards);
    } catch {
        res.status(500).json({ error: 'Failed to generate shop offerings' });
    }
});

export default router;
