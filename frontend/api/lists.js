import { getPool, init } from './_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);

  if (req.method === 'GET') {
    const userId = req.query.userId ?? 1;
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const userId = req.body.userId ?? 1;
    const name = (req.body.name || 'New List').trim() || 'New List';
    const { rows } = await pool.query(
      'INSERT INTO lists (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
