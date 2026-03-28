import { useState, useMemo } from 'react';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import './ProductSheet.css';

export default function ProductSheet({ category, onAdd, onBack, onCustom }) {
  const [query, setQuery] = useState('');

  const emoji = CATEGORIES.find(c => c.name === category)?.emoji ?? '📦';
  const data   = PRODUCTS[category] ?? { common: [], all: [] };

  const { common, rest } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      // When searching, flatten everything and filter
      const all = [...new Set([...data.common, ...data.all])];
      return { common: all.filter(p => p.toLowerCase().includes(q)), rest: [] };
    }
    return { common: data.common, rest: data.all };
  }, [query, data]);

  const handleAdd = (name) => onAdd(name, category);

  return (
    <>
      <div className="sheet-backdrop" onClick={onBack} />
      <div className="product-sheet sheet-full">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="product-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="product-title">{emoji} {category}</span>
          <button className="custom-btn" onClick={onCustom}>Custom</button>
        </div>

        {/* Search */}
        <div className="sheet-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="sheet-search"
            type="text"
            placeholder={`Search in ${category}…`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && <button className="search-clear" onClick={() => setQuery('')}>✕</button>}
        </div>

        {/* Product list */}
        <div className="product-list">
          {query.trim() === '' ? (
            <>
              <Section title="Common" items={common} onAdd={handleAdd} />
              <Section title="All"    items={rest}   onAdd={handleAdd} />
            </>
          ) : (
            <>
              {common.length > 0
                ? <Section title="Results" items={common} onAdd={handleAdd} />
                : <p className="no-results">No products found</p>}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, items, onAdd }) {
  if (!items.length) return null;
  return (
    <div className="product-section">
      <p className="section-label">{title}</p>
      {items.map(name => (
        <button key={name} className="product-row" onClick={() => onAdd(name)}>
          <span className="product-name">{name}</span>
          <span className="product-add">+</span>
        </button>
      ))}
    </div>
  );
}
