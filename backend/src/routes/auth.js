import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../database.js';

const router = Router();

// POST /auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email and password are required' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hash]
        );
        const token = jwt.sign({ id: result.insertId, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, username });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or email already taken' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }
    try {
        const [[user]] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username, is_admin: user.is_admin ?? 0 });
    } catch {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
