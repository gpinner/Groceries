import { getPool, init } from './_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY category, name');
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { name, category = 'Other', quantity = 1, unit = '' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await pool.query(
      'INSERT INTO items (name, category, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), category.trim(), quantity, unit.trim()]
    );
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
