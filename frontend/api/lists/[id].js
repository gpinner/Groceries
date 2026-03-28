import { getPool, init } from '../_db.js';

export default async function handler(req, res) {
  const pool = getPool();
  await init(pool);
  const { id } = req.query;

  if (req.method === 'PUT') {
    const name = (req.body.name || 'New List').trim() || 'New List';
    const { rows } = await pool.query(
      'UPDATE lists SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'List not found' });
    return res.json(rows[0]);
  }

  if (req.method === 'DELETE') {
    const { rowCount } = await pool.query('DELETE FROM lists WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'List not found' });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
