import { Router } from "express";
import pool from "../../database.js";
import requireAuth from "../middleware/auth.js";
import { toCard } from "../utils/cardTransform.js";

const router = Router();

// GET /shop/offerings/:runId
// Uses sp_get_shop_offerings: generates 5 persistent offerings on first call,
// returns the same set on subsequent calls for the same run.
router.get('/offerings/:runId', requireAuth, async (req, res) => {
    try {
        const [results] = await pool.query('CALL sp_get_shop_offerings(?)', [req.params.runId]);
        const cards = results[0].map(toCard);
        res.json(cards);
    } catch (err) {
        console.error('GET /shop/offerings error:', err.message);
        res.status(500).json({ error: 'Failed to generate shop offerings' });
    }
});

// POST /shop/buy  — body: { runId, cardId }
// Uses sp_buy_card: validates offering, marks sold (trg_shop_offering_sold logs event),
// inserts into run_cards (trg_cards_collected_count updates counter).
router.post('/buy', requireAuth, async (req, res) => {
    const { runId, cardId } = req.body;
    if (!runId || !cardId) {
        return res.status(400).json({ error: 'runId and cardId are required' });
    }
    try {
        await pool.query('CALL sp_buy_card(?, ?)', [runId, cardId]);
        res.json({ bought: true });
    } catch (err) {
        const msg = err.message ?? '';
        if (msg.includes('Offering not found')) return res.status(404).json({ error: msg });
        if (msg.includes('already sold'))       return res.status(409).json({ error: msg });
        console.error('POST /shop/buy error:', err.message);
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});

export default router;
