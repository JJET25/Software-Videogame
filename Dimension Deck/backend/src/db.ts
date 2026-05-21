import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// ─── Pool singleton ──────────────────────────────────────────────────────────

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     ?? 'localhost',
      port:               Number(process.env.DB_PORT ?? 3306),
      user:               process.env.DB_USER     ?? 'root',
      password:           process.env.DB_PASSWORD ?? '',
      database:           process.env.DB_NAME     ?? 'dimension_deck',
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      timezone:           '+00:00',
    });
  }
  return pool;
}

// ─── Query helpers ────────────────────────────────────────────────────────────

/** Run a SELECT query and return typed rows. */
export async function query<T extends RowDataPacket>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await getPool().execute<T[]>(sql, params);
  return rows;
}

/** Run an INSERT / UPDATE / DELETE and return the result header. */
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

/** Wrap multiple statements in a transaction. Rolls back on any thrown error. */
export async function transaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ─── Health check ─────────────────────────────────────────────────────────────

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await query('SELECT 1');
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

// ─── Schema reflection ────────────────────────────────────────────────────────
// Useful for future prompt context: call reflectSchema() to get a live snapshot
// of every table and column, so you can paste it into a prompt as ground truth.

export interface ColumnInfo {
  column: string;
  type: string;
  nullable: boolean;
  key: string;
  default: string | null;
}

export interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

export async function reflectSchema(dbName?: string): Promise<TableSchema[]> {
  const database = dbName ?? (process.env.DB_NAME ?? 'dimension_deck');

  const tables = await query<RowDataPacket & { TABLE_NAME: string }>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [database]
  );

  const schema: TableSchema[] = [];

  for (const { TABLE_NAME } of tables) {
    const columns = await query<RowDataPacket & {
      COLUMN_NAME: string;
      COLUMN_TYPE: string;
      IS_NULLABLE: string;
      COLUMN_KEY: string;
      COLUMN_DEFAULT: string | null;
    }>(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [database, TABLE_NAME]
    );

    schema.push({
      table: TABLE_NAME,
      columns: columns.map((c) => ({
        column:   c.COLUMN_NAME,
        type:     c.COLUMN_TYPE,
        nullable: c.IS_NULLABLE === 'YES',
        key:      c.COLUMN_KEY,
        default:  c.COLUMN_DEFAULT,
      })),
    });
  }

  return schema;
}

/** Print schema as a compact text block — paste into AI prompts for context. */
export async function printSchema(): Promise<void> {
  const schema = await reflectSchema();
  for (const { table, columns } of schema) {
    console.log(`\n── ${table}`);
    for (const col of columns) {
      const flags = [
        col.key === 'PRI' ? 'PK' : col.key === 'MUL' ? 'FK' : '',
        col.nullable ? 'NULL' : 'NOT NULL',
        col.default !== null ? `DEFAULT ${col.default}` : '',
      ].filter(Boolean).join(', ');
      console.log(`   ${col.column.padEnd(30)} ${col.type.padEnd(24)} ${flags}`);
    }
  }
}
