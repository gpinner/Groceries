import { getPool, init } from '../../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const pool = getPool();
  await init(pool);
  const { listId } = req.query;
  if (!listId) return res.status(400).json({ error: 'listId is required' });
  await pool.query('DELETE FROM items WHERE checked = TRUE AND list_id = $1', [listId]);
  res.status(204).end();
}
