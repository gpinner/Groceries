import express from 'express';
import cors from 'cors';
import pool, { init } from './db.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// ── Lists ──────────────────────────────────────────────────────────────────

app.get('/api/lists', async (req, res) => {
  try {
    const userId = req.query.userId ?? 1;
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/lists', async (req, res) => {
  try {
    const userId = req.body.userId ?? 1;
    const name = (req.body.name || 'New List').trim() || 'New List';
    const { rows } = await pool.query(
      'INSERT INTO lists (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/lists/:id', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Name required' });
    const { rows } = await pool.query(
      'UPDATE lists SET name=$1 WHERE id=$2 RETURNING *',
      [name, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'List not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/lists/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM lists WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Items ──────────────────────────────────────────────────────────────────

app.get('/api/items', async (req, res) => {
  try {
    const { listId } = req.query;
    if (!listId) return res.status(400).json({ error: 'listId is required' });
    const { rows } = await pool.query(
      'SELECT * FROM items WHERE list_id = $1 ORDER BY category, name',
      [listId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, category = 'Other', quantity = 1, unit = '', list_id } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!list_id)      return res.status(400).json({ error: 'list_id is required' });
    const { rows } = await pool.query(
      'INSERT INTO items (list_id, name, category, quantity, unit) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [list_id, name.trim(), category.trim(), quantity, unit.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/items?listId=X  — clear all checked items for a list
app.delete('/api/items', async (req, res) => {
  try {
    const { listId } = req.query;
    if (!listId) return res.status(400).json({ error: 'listId is required' });
    await pool.query('DELETE FROM items WHERE list_id=$1 AND checked=TRUE', [listId]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM items WHERE id=$1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Item not found' });
    const item = existing[0];
    const body = req.body ?? {};
    const name     = body.name     !== undefined ? String(body.name).trim()      : item.name;
    const category = body.category !== undefined ? String(body.category).trim()  : item.category;
    const quantity = body.quantity !== undefined ? body.quantity                  : item.quantity;
    const unit     = body.unit     !== undefined ? String(body.unit ?? '').trim() : (item.unit ?? '');
    const checked  = body.checked  !== undefined ? Boolean(body.checked)         : item.checked;
    const { rows } = await pool.query(
      'UPDATE items SET name=$1,category=$2,quantity=$3,unit=$4,checked=$5 WHERE id=$6 RETURNING *',
      [name, category, quantity, unit, checked, req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM items WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Boot ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
init()
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch(err => { console.error('DB init failed', err); process.exit(1); });
