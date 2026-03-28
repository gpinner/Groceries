import { getPool, init } from './_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);

  if (req.method === 'GET') {
    const { listId } = req.query;
    if (!listId) return res.status(400).json({ error: 'listId is required' });
    const { rows } = await pool.query(
      'SELECT * FROM items WHERE list_id = $1 ORDER BY category, name',
      [listId]
    );
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { name, category = 'Other', quantity = 1, unit = '', list_id } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!list_id)      return res.status(400).json({ error: 'list_id is required' });
    const { rows } = await pool.query(
      'INSERT INTO items (list_id, name, category, quantity, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [list_id, name.trim(), category.trim(), quantity, unit.trim()]
    );
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
