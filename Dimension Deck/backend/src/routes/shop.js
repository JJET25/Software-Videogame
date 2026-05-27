import { Router } from 'express';
import pool from '../../database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();
const SHOP_SIZE = 5;

function toCard({ effect_range, spread, shield, invincibility,
                  trigger_event, threshold, heal_pct, full_heal, from_enemy,
                  ...card }) {
    return {
        ...card,
        effect_json: {
            range:         effect_range   ?? null,
            spread:        spread         ?? null,
            shield:        shield         ?? null,
            invincibility: invincibility  ?? null,
            trigger:       trigger_event  ?? null,
            threshold:     threshold      ?? null,
            heal_pct:      heal_pct       ?? null,
            full_heal:     full_heal      ?? 0,
            from_enemy:    from_enemy     ?? 0,
        },
    };
}

// GET /shop/offerings/:runId  — 5 random purchasable cards for this run
router.get('/offerings/:runId', requireAuth, async (req, res) => {
    try {
        const [owned] = await pool.query(
            'SELECT card_id FROM run_cards WHERE run_id = ?',
            [req.params.runId]
        );
        const ownedIds = owned.map(r => r.card_id);

        let query = `
            SELECT
                c.id, c.card_name, cs.card_type, cs.subtype, r.name AS rarity,
                c.base_damage, c.base_heal, c.cooldown_seconds, c.shop_cost, c.description,
                ep.effect_range, ep.spread, ep.shield, ep.invincibility,
                ep.trigger_event, ep.threshold, ep.heal_pct, ep.full_heal, ep.from_enemy
            FROM cards c
            JOIN card_subtypes cs ON cs.id  = c.subtype_id
            JOIN rarities      r  ON r.id   = c.rarity_id
            LEFT JOIN card_effect_params ep ON ep.card_id = c.id
            WHERE c.shop_cost > 0
        `;
        const args = [];

        if (ownedIds.length) {
            query += ' AND c.id NOT IN (?)';
            args.push(ownedIds);
        }

        query += ' ORDER BY RAND() LIMIT ?';
        args.push(SHOP_SIZE);

        const [cards] = await pool.query(query, args);
        res.json(cards.map(toCard));
    } catch (err) {
        console.error('GET /shop/offerings:', err.message);
        res.status(500).json({ error: 'Failed to generate shop offerings' });
    }
});

export default router;
