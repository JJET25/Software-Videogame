// Run once: node seed_admin.js
// Creates (or updates) the Admin user with password "123"
import bcrypt from 'bcryptjs';
import pool from './database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });

const hash = await bcrypt.hash('123', 10);

const [[existing]] = await pool.query('SELECT id FROM users WHERE username = ?', ['Admin']);

if (existing) {
    await pool.query(
        'UPDATE users SET password_hash = ?, is_admin = 1 WHERE username = ?',
        [hash, 'Admin']
    );
    console.log('Admin user updated.');
} else {
    await pool.query(
        'INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, 1)',
        ['Admin', 'admin@dimensiondeck.com', hash]
    );
    console.log('Admin user created.');
}

process.exit(0);
