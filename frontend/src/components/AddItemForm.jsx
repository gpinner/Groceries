import { useState } from 'react';
import { CATEGORIES } from './CategorySheet.jsx';
import './AddItemForm.css';

const UNITS = ['', 'pc', 'lb', 'oz', 'kg', 'g', 'L', 'mL', 'dozen', 'pack', 'can', 'bag', 'box'];

export default function AddItemForm({ initialCategory = 'Other', onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ name: name.trim(), category, quantity: parseFloat(quantity) || 1, unit });
      setName('');
      setQuantity('1');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const catEmoji = CATEGORIES.find(c => c.name === category)?.emoji ?? '📦';

  return (
    <>
      <div className="sheet-backdrop" onClick={onCancel} />
      <form className="add-form" onSubmit={handleSubmit}>
        <div className="sheet-handle" />
        <div className="add-category-label">
          <span>{catEmoji}</span> {category}
        </div>
        <div className="add-form-row">
          <input
            className="name-input"
            type="text"
            placeholder="Item name..."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="add-form-row">
          <input
            type="number"
            className="qty-input"
            min="0.01"
            step="any"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            aria-label="Quantity"
          />
          <select value={unit} onChange={e => setUnit(e.target.value)} aria-label="Unit">
            {UNITS.map(u => (
              <option key={u} value={u}>{u || '—'}</option>
            ))}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Category" className="cat-select">
            {CATEGORIES.map(({ name: n }) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="add-form-row actions">
          <button type="submit" className="add-btn" disabled={submitting || !name.trim()}>
            {submitting ? '...' : 'Add Item'}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </>
  );
}
