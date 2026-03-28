import { getPool, init } from './_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM lists ORDER BY created_at ASC');
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const name = (req.body.name || 'New List').trim() || 'New List';
    const { rows } = await pool.query(
      'INSERT INTO lists (name) VALUES ($1) RETURNING *',
      [name]
    );
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
