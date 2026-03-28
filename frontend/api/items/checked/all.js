import { getPool, init } from '../../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const pool = getPool();
  await init(pool);
  await pool.query('DELETE FROM items WHERE checked = TRUE');
  res.status(204).end();
}
