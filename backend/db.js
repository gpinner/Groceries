import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id        SERIAL PRIMARY KEY,
      name      TEXT    NOT NULL,
      category  TEXT    NOT NULL DEFAULT 'Other',
      quantity  REAL    NOT NULL DEFAULT 1,
      unit      TEXT    NOT NULL DEFAULT '',
      checked   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now())::bigint
    )
  `);
}

export default pool;
