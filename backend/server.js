import express from 'express';
import cors from 'cors';
import pool, { init } from './db.js';

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Get all items, ordered by category then name
app.get('/api/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY category, name');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add a new item
app.post('/api/items', async (req, res) => {
  const { name, category = 'Other', quantity = 1, unit = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO items (name, category, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), category.trim(), quantity, unit.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update an item (toggle checked, edit fields)
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
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
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete all checked items
app.delete('/api/items/checked/all', async (req, res) => {
  try {
    await pool.query('DELETE FROM items WHERE checked = TRUE');
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
init()
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch(err => { console.error('DB init failed', err); process.exit(1); });
