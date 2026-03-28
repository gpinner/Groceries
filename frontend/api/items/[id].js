import { getPool, init } from '../_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { rows: existing } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Item not found' });
    const item = existing[0];
    const {
      name = item.name,
      category = item.category,
      quantity = item.quantity,
      unit = item.unit,
      checked = item.checked,
    } = req.body;
    const { rows } = await pool.query(
      'UPDATE items SET name=$1, category=$2, quantity=$3, unit=$4, checked=$5 WHERE id=$6 RETURNING *',
      [name.trim(), category.trim(), quantity, unit.trim(), checked, id]
    );
    return res.json(rows[0]);
  }

  if (req.method === 'DELETE') {
    const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
