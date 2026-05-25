import { Router } from 'express';
import pool from '../../database.js';

const router = Router();

const STARTER_NAMES = ['Quick Strike', 'Heal Pulse', 'Wood Shield'];

// GET /cards
router.get('/', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cards ORDER BY card_type, rarity, card_name');
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// GET /cards/starter
router.get('/starter', async (_req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM cards WHERE card_name IN (?) ORDER BY FIELD(card_name, ?)',
            [STARTER_NAMES, STARTER_NAMES]
        );
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Failed to fetch starter cards' });
    }
});

// GET /cards/:id
router.get('/:id', async (req, res) => {
    try {
        const [[card]] = await pool.query('SELECT * FROM cards WHERE id = ?', [req.params.id]);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json(card);
    } catch {
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

export default router;
