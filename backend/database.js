// database.js — MySQL connection pool shared across all backend routes.
// Reads connection credentials from the .env file located in the backend directory.

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: new URL('.env', import.meta.url).pathname });

const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

pool.on('error', (err) => console.error('[DB Pool Error]', err.message));

export default pool;
