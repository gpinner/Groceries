import pkg from 'pg';
const { Pool } = pkg;

let pool;

export function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function init(pool) {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       TEXT   NOT NULL,
      email      TEXT,
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now())::bigint
    )
  `);

  // Lists table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lists (
      id         SERIAL PRIMARY KEY,
      name       TEXT   NOT NULL DEFAULT 'New List',
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

  // Migrations for existing deployments
  await pool.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE`);
  await pool.query(`ALTER TABLE lists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);

  // Dev user: Greg Pin (id=1)
  await pool.query(`
    INSERT INTO users (id, name, email) VALUES (1, 'Greg Pin', 'greg@example.com')
    ON CONFLICT (id) DO NOTHING
  `);

  // Assign all ownerless lists to Greg Pin
  await pool.query(`UPDATE lists SET user_id = 1 WHERE user_id IS NULL`);

  // Ensure Greg Pin has at least one list
  const { rows: userLists } = await pool.query('SELECT id FROM lists WHERE user_id = 1 LIMIT 1');
  let defaultId;
  if (userLists.length === 0) {
    const { rows } = await pool.query("INSERT INTO lists (name, user_id) VALUES ('My List', 1) RETURNING id");
    defaultId = rows[0].id;
  } else {
    defaultId = userLists[0].id;
  }

  // Assign orphaned items to the default list
  await pool.query('UPDATE items SET list_id = $1 WHERE list_id IS NULL', [defaultId]);
}
