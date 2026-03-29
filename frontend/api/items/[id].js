import { getPool, init } from '../_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { rows: existing } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Item not found' });
    const item = existing[0];
    // Use explicit undefined check so that false / 0 are kept as-is
    const body = req.body ?? {};
    const name     = body.name     !== undefined ? String(body.name).trim()     : item.name;
    const category = body.category !== undefined ? String(body.category).trim() : item.category;
    const quantity = body.quantity !== undefined ? body.quantity                 : item.quantity;
    const unit     = body.unit     !== undefined ? String(body.unit ?? '').trim(): (item.unit ?? '');
    const checked  = body.checked  !== undefined ? Boolean(body.checked)        : item.checked;
    const { rows } = await pool.query(
      'UPDATE items SET name=$1, category=$2, quantity=$3, unit=$4, checked=$5 WHERE id=$6 RETURNING *',
      [name, category, quantity, unit, checked, id]
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
