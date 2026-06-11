// requireAdmin.js — Express middleware that restricts access to admin users.
// Must be used after requireAuth; returns 403 if the authenticated user does not have is_admin set.

import pool from '../../database.js';

export default async function requireAdmin(req, res, next) {
  try {
    const [[user]] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [req.user.id]);
    if (!user?.is_admin) return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch {
    res.status(500).json({ error: 'Authorization check failed' });
  }
}
