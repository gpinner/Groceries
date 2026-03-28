import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Get all items, ordered by category then name
app.get('/api/items', (req, res) => {
  const items = db.prepare(
    'SELECT * FROM items ORDER BY category, name'
  ).all();
  res.json(items.map(item => ({ ...item, checked: !!item.checked })));
});

// Add a new item
app.post('/api/items', (req, res) => {
  const { name, category = 'Other', quantity = 1, unit = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = db.prepare(
    'INSERT INTO items (name, category, quantity, unit) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), category.trim(), quantity, unit.trim());
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...item, checked: !!item.checked });
});

// Update an item (toggle checked, edit fields)
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  const {
    name = existing.name,
    category = existing.category,
    quantity = existing.quantity,
    unit = existing.unit,
    checked = existing.checked,
  } = req.body;

  db.prepare(
    'UPDATE items SET name=?, category=?, quantity=?, unit=?, checked=? WHERE id=?'
  ).run(name.trim(), category.trim(), quantity, unit.trim(), checked ? 1 : 0, id);

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  res.json({ ...item, checked: !!item.checked });
});

// Delete an item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
});

// Delete all checked items
app.delete('/api/items/checked/all', (req, res) => {
  db.prepare('DELETE FROM items WHERE checked = 1').run();
  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
