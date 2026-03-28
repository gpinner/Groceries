import { useState } from 'react';
import './CategorySheet.css';

export const CATEGORIES = [
  { name: 'Produce',        emoji: '🥦' },
  { name: 'Dairy',          emoji: '🥛' },
  { name: 'Meat & Seafood', emoji: '🥩' },
  { name: 'Bakery',         emoji: '🍞' },
  { name: 'Frozen',         emoji: '🧊' },
  { name: 'Pantry',         emoji: '🥫' },
  { name: 'Beverages',      emoji: '🥤' },
  { name: 'Snacks',         emoji: '🍿' },
  { name: 'Household',      emoji: '🧹' },
  { name: 'Other',          emoji: '📦' },
];

export default function CategorySheet({ onSelect, onClose }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? CATEGORIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : CATEGORIES;

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="category-sheet sheet-half">
        <div className="sheet-handle" />
        <h2 className="sheet-title">What are you adding?</h2>

        <div className="sheet-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="sheet-search"
            type="text"
            placeholder="Search categories…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        <div className="category-grid">
          {filtered.length === 0 && (
            <p className="no-results">No categories found</p>
          )}
          {filtered.map(({ name, emoji }) => (
            <button key={name} className="category-tile" onClick={() => onSelect(name)}>
              <span className="cat-emoji">{emoji}</span>
              <span className="cat-name">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
