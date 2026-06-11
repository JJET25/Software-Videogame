import { Router } from 'express';
import pool from '../../database.js';
import { toCard } from '../utils/cardTransform.js';

const router = Router();

const STARTER_NAMES = ['Quick Strike', 'Heal Pulse', 'Wood Shield'];

// Fetch individual typed columns instead of JSON_OBJECT to avoid mysql2
// type-parsing inconsistencies across MySQL versions.
const CARD_SELECT = `
    SELECT
        c.id,
        c.card_name,
        cs.card_type,
        cs.subtype,
        r.name             AS rarity,
        c.base_damage,
        c.base_heal,
        c.cooldown_seconds,
        c.shop_cost,
        c.description,
        ep.effect_range,
        ep.spread,
        ep.shield,
        ep.invincibility,
        ep.trigger_event,
        ep.threshold,
        ep.heal_pct,
        ep.full_heal,
        ep.from_enemy
    FROM cards c
    JOIN card_subtypes cs ON cs.id  = c.subtype_id
    JOIN rarities      r  ON r.id   = c.rarity_id
    LEFT JOIN card_effect_params ep ON ep.card_id = c.id
`;

// GET /cards
router.get('/', async (_req, res) => {
    try {
        const [rows] = await pool.query(
            `${CARD_SELECT} ORDER BY cs.card_type, r.display_order, c.card_name`
        );
        res.json(rows.map(toCard));
    } catch (err) {
        console.error('GET /cards:', err.message);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// GET /cards/starter
router.get('/starter', async (_req, res) => {
    try {
        const [rows] = await pool.query(
            `${CARD_SELECT} WHERE c.card_name IN (?) ORDER BY FIELD(c.card_name, ?)`,
            [STARTER_NAMES, STARTER_NAMES]
        );
        res.json(rows.map(toCard));
    } catch (err) {
        console.error('GET /cards/starter:', err.message);
        res.status(500).json({ error: 'Failed to fetch starter cards' });
    }
});

// GET /cards/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`${CARD_SELECT} WHERE c.id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Card not found' });
        res.json(toCard(rows[0]));
    } catch (err) {
        console.error('GET /cards/:id:', err.message);
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

export default router;
