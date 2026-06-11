// shop.js — Routes for generating and purchasing shop card offerings during a run.
// Both routes require authentication. Purchase logic is handled by stored procedures on the DB side.

import { Router } from "express";
import pool from "../../database.js";
import requireAuth from "../middleware/auth.js";
import { toCard } from "../utils/cardTransform.js";

const router = Router();

// GET /shop/offerings/:runId — Returns the card offerings available in the shop for a given run.
// Input: route param runId. The procedure sp_get_shop_offerings generates 5 offerings on first call
// and returns the same set on subsequent calls for the same run. Returns an array of card objects.
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

// POST /shop/buy — Purchases a card offering for the authenticated user's run.
// Input: { runId, cardId }. Uses sp_buy_card to validate the offering and mark it as sold.
// The trigger trg_shop_offering_sold logs the event; trg_cards_collected_count updates the run counter.
// Returns 404 if the offering does not exist; 409 if already sold.
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
