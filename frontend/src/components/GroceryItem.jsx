import { useState } from 'react';
import { CATEGORIES } from './CategorySheet.jsx';
import './GroceryItem.css';

const UNITS = ['', 'pc', 'lb', 'oz', 'kg', 'g', 'L', 'mL', 'dozen', 'pack', 'can', 'bag', 'box'];

export default function GroceryItem({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit]       = useState(item.unit);
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(item.id, {
        name: name.trim(), category,
        quantity: parseFloat(quantity) || 1,
        unit, checked: item.checked,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(item.name); setCategory(item.category);
    setQuantity(String(item.quantity)); setUnit(item.unit);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="grocery-item editing">
        <input
          className="edit-name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          placeholder="Item name"
        />
        <div className="edit-row">
          <input
            type="number" className="edit-qty"
            min="0.01" step="any"
            value={quantity} onChange={e => setQuantity(e.target.value)}
          />
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u || '—'}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(({ name: n }) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="edit-actions">
          <button className="save-btn" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? '...' : 'Save'}
          </button>
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </li>
    );
  }

  const qtyLabel = `${item.quantity}${item.unit ? ' ' + item.unit : ''}`;

  return (
    <li className={`grocery-item ${item.checked ? 'checked' : ''}`}>
      <button
        className="check-btn"
        onClick={() => onToggle(item.id, !item.checked)}
        aria-label={item.checked ? 'Uncheck' : 'Check'}
      >
        {item.checked ? '✓' : ''}
      </button>

      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-qty">{qtyLabel}</span>
      </div>

      <div className="item-actions">
        <button className="edit-btn" onClick={() => setEditing(true)} aria-label="Edit">
          ✏️
        </button>
        <button className="delete-btn" onClick={() => onDelete(item.id)} aria-label="Delete">
          🗑️
        </button>
      </div>
    </li>
  );
}
