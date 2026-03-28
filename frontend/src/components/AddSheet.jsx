import { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS }   from '../data/products.js';
import './AddSheet.css';

// Flatten all products for global search
const ALL_PRODUCTS = Object.entries(PRODUCTS).flatMap(([cat, { common, all }]) =>
  [...new Set([...common, ...all])].map(name => ({ name, category: cat }))
);

export default function AddSheet({ onAdd, onCustom, onClose }) {
  const [query, setQuery]             = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [expanded, setExpanded]       = useState(false);
  const inputRef = useRef(null);

  // Expand once — never shrink
  const expand = () => { if (!expanded) setExpanded(true); };

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val) { expand(); setSelectedCat(null); }
  };

  const handleCatSelect = (cat) => {
    setSelectedCat(cat);
    expand();
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleBack = () => {
    setSelectedCat(null);
    setQuery('');
  };

  /* ── Derived content ── */
  const globalResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
  }, [query]);

  const catData = selectedCat ? PRODUCTS[selectedCat] ?? { common: [], all: [] } : null;

  const filteredCatProducts = useMemo(() => {
    if (!catData) return { common: [], rest: [] };
    if (!query.trim()) return { common: catData.common, rest: catData.all };
    const q = query.toLowerCase();
    const all = [...new Set([...catData.common, ...catData.all])];
    return { common: all.filter(p => p.toLowerCase().includes(q)), rest: [] };
  }, [catData, query]);

  /* ── What to show in the scrollable body ── */
  const showGlobalSearch  = !selectedCat && query.trim().length > 0;
  const showCategoryView  = !!selectedCat;
  const showCategoryGrid  = !selectedCat && !query.trim();

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />

      <div className={`add-sheet ${expanded ? 'full' : 'half'}`}>
        <div className="sheet-handle" />

        {/* Header */}
        {showCategoryView ? (
          <div className="sheet-cat-header">
            <button className="back-btn" onClick={handleBack}>←</button>
            <span className="sheet-cat-title">
              {CATEGORIES.find(c => c.name === selectedCat)?.emoji} {selectedCat}
            </span>
            <button className="custom-link" onClick={() => onCustom(selectedCat)}>Custom</button>
          </div>
        ) : (
          <h2 className="sheet-title">
            {showGlobalSearch ? 'Results' : 'What are you adding?'}
          </h2>
        )}

        {/* Scrollable body */}
        <div className="sheet-body">
          {/* Category grid */}
          {showCategoryGrid && (
            <div className="category-grid">
              {CATEGORIES.map(({ name, emoji }) => (
                <button key={name} className="category-tile" onClick={() => handleCatSelect(name)}>
                  <span className="cat-emoji">{emoji}</span>
                  <span className="cat-name">{name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Global search results */}
          {showGlobalSearch && (
            <div className="product-list">
              {globalResults.length === 0 ? (
                <div className="no-results">
                  <p>No products found</p>
                  <button className="custom-link-center" onClick={() => onCustom(null)}>
                    Add "{query}" as custom item
                  </button>
                </div>
              ) : (
                globalResults.map(({ name, category }) => (
                  <button key={`${category}-${name}`} className="product-row"
                    onClick={() => onAdd(name, category)}>
                    <div className="product-row-info">
                      <span className="product-name">{name}</span>
                      <span className="product-cat-badge">
                        {CATEGORIES.find(c => c.name === category)?.emoji} {category}
                      </span>
                    </div>
                    <span className="product-add">+</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Category product list */}
          {showCategoryView && (
            <div className="product-list">
              {query.trim() ? (
                filteredCatProducts.common.length === 0 ? (
                  <div className="no-results">
                    <p>No products found</p>
                    <button className="custom-link-center" onClick={() => onCustom(selectedCat)}>
                      Add "{query}" as custom item
                    </button>
                  </div>
                ) : (
                  <ProductSection title="Results" items={filteredCatProducts.common}
                    onAdd={n => onAdd(n, selectedCat)} />
                )
              ) : (
                <>
                  <ProductSection title="Common" items={filteredCatProducts.common}
                    onAdd={n => onAdd(n, selectedCat)} />
                  <ProductSection title="All"    items={filteredCatProducts.rest}
                    onAdd={n => onAdd(n, selectedCat)} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Search bar — always pinned at bottom */}
        <div className="sheet-search-bar">
          <div className="sheet-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              className="sheet-search"
              type="text"
              placeholder={selectedCat ? `Search in ${selectedCat}…` : 'Search products…'}
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
            />
            {query && (
              <button className="search-clear" onClick={() => handleQueryChange('')}>✕</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProductSection({ title, items, onAdd }) {
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
