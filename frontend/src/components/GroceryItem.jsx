import { useState } from 'react';
import './GroceryItem.css';

const CATEGORIES = [
  'Produce', 'Dairy', 'Meat & Seafood', 'Bakery', 'Frozen',
  'Pantry', 'Beverages', 'Snacks', 'Household', 'Other',
];

const UNITS = ['', 'pc', 'lb', 'oz', 'kg', 'g', 'L', 'mL', 'dozen', 'pack', 'can', 'bag', 'box'];

export default function GroceryItem({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit);
  const [saving, setSaving] = useState(false);

  const handleToggle = () => onToggle(item.id, !item.checked);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(item.id, {
        name: name.trim(),
        category,
        quantity: parseFloat(quantity) || 1,
        unit,
        checked: item.checked,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(item.name);
    setCategory(item.category);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setEditing(false);
  };

  const qtyLabel = `${item.quantity}${item.unit ? ' ' + item.unit : ''}`;

  if (editing) {
    return (
      <li className="grocery-item editing">
        <div className="edit-row">
          <input
            className="edit-name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="edit-row secondary">
          <input
            type="number"
            className="edit-qty"
            min="0.01"
            step="any"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u || '—'}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="edit-actions">
          <button className="save-btn" onClick={handleSave} disabled={saving || !name.trim()}>
            Save
          </button>
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className={`grocery-item ${item.checked ? 'checked' : ''}`}>
      <button className="check-btn" onClick={handleToggle} aria-label={item.checked ? 'Uncheck' : 'Check'}>
        <span className="checkmark">{item.checked ? '✓' : ''}</span>
      </button>
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-qty">{qtyLabel}</span>
      </div>
      <div className="item-actions">
        <button className="edit-btn" onClick={() => setEditing(true)} aria-label="Edit">✏️</button>
        <button className="delete-btn" onClick={() => onDelete(item.id)} aria-label="Delete">✕</button>
      </div>
    </li>
  );
}
