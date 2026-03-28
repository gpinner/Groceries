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
            {saving ? '…' : 'Save'}
          </button>
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </li>
    );
  }

  const qtyLabel = item.quantity > 0
    ? `${item.quantity}${item.unit ? '\u202f' + item.unit : ''}`
    : null;

  return (
    <li className={`grocery-item ${item.checked ? 'checked' : ''}`}>
      {/* Large check circle — primary action */}
      <button
        className="check-circle"
        onClick={() => onToggle(item.id, !item.checked)}
        aria-label={item.checked ? 'Restore item' : 'Mark as done'}
      >
        <span className="check-ring" />
        {item.checked && (
          <svg className="check-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {item.checked && <span className="restore-hint">↩</span>}
      </button>

      {/* Product info */}
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        {qtyLabel && <span className="item-qty">{qtyLabel}</span>}
      </div>

      {/* Secondary actions */}
      <div className="item-actions">
        {!item.checked && (
          <button className="edit-btn" onClick={() => setEditing(true)} aria-label="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button className="delete-btn" onClick={() => onDelete(item.id)} aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </li>
  );
}
