import { useState } from 'react';
import './AddItemForm.css';

const CATEGORIES = [
  'Produce', 'Dairy', 'Meat & Seafood', 'Bakery', 'Frozen',
  'Pantry', 'Beverages', 'Snacks', 'Household', 'Other',
];

const UNITS = ['', 'pc', 'lb', 'oz', 'kg', 'g', 'L', 'mL', 'dozen', 'pack', 'can', 'bag', 'box'];

export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
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

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-row primary">
        <input
          className="name-input"
          type="text"
          placeholder="Item name..."
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button type="submit" className="add-btn" disabled={submitting || !name.trim()}>
          {submitting ? '...' : 'Add'}
        </button>
      </div>
      <div className="add-form-row secondary">
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
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Category">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
