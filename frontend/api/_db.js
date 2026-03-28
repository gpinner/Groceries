import pkg from 'pg';
const { Pool } = pkg;

let pool;

export function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function init(pool) {
  // Lists table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lists (
      id         SERIAL PRIMARY KEY,
      name       TEXT   NOT NULL DEFAULT 'New List',
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now())::bigint
    )
  `);

  // Items table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id         SERIAL  PRIMARY KEY,
      list_id    INTEGER REFERENCES lists(id) ON DELETE CASCADE,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL DEFAULT 'Other',
      quantity   REAL    NOT NULL DEFAULT 1,
      unit       TEXT    NOT NULL DEFAULT '',
      checked    BOOLEAN NOT NULL DEFAULT FALSE,
      created_at BIGINT  NOT NULL DEFAULT extract(epoch from now())::bigint
    )
  `);

  // Migration: add list_id column if missing (for existing deployments)
  await pool.query(`
    ALTER TABLE items ADD COLUMN IF NOT EXISTS list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE
  `);

  // Migration: ensure at least one default list exists
  const { rows: existing } = await pool.query('SELECT id FROM lists LIMIT 1');
  let defaultId;
  if (existing.length === 0) {
    const { rows } = await pool.query("INSERT INTO lists (name) VALUES ('My List') RETURNING id");
    defaultId = rows[0].id;
  } else {
    defaultId = existing[0].id;
  }

  // Migration: assign orphaned items to the default list
  await pool.query('UPDATE items SET list_id = $1 WHERE list_id IS NULL', [defaultId]);
}
