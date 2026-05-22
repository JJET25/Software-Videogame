import { Router } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body as Record<string, string>;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email and password are required' });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await execute(
      'INSERT INTO player (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    const token = jwt.sign({ playerId: result.insertId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ playerId: result.insertId, username, token });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Username or email already taken' });
    } else {
      throw err;
    }
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body as Record<string, string>;
  const [player] = await query<RowDataPacket>(
    'SELECT player_id, username, password_hash FROM player WHERE username = ?',
    [username]
  );
  if (!player || !(await bcrypt.compare(password, player.password_hash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign(
    { playerId: player.player_id, username: player.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ playerId: player.player_id, username: player.username, token });
});

export default router;
