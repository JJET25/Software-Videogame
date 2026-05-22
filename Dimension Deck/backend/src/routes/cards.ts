import { Router } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { query } from '../db';

const router = Router();

// GET /cards — full card catalog (used in card selection and shop screens)
router.get('/', async (_req, res) => {
  const cards = await query<RowDataPacket>('SELECT * FROM v_card_catalog');
  res.json(cards);
});

export default router;
