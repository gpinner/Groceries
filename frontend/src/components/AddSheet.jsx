import { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS }   from '../data/products.js';
import './AddSheet.css';

// Flatten all products for global search
const ALL_PRODUCTS = Object.entries(PRODUCTS).flatMap(([cat, { common, all }]) =>
  [...new Set([...common, ...all])].map(name => ({ name, category: cat }))
);

// Per-product emoji overrides; falls back to category emoji
const PRODUCT_EMOJIS = {
  'Bananas':'🍌','Apples':'🍎','Tomatoes':'🍅','Onions':'🧅','Potatoes':'🥔',
  'Carrots':'🥕','Lettuce':'🥬','Spinach':'🥬','Avocado':'🥑','Lemons':'🍋',
  'Garlic':'🧄','Broccoli':'🥦','Cucumber':'🥒','Bell Peppers':'🫑','Mushrooms':'🍄',
  'Grapes':'🍇','Strawberries':'🍓','Oranges':'🍊','Blueberries':'🫐','Limes':'🍋',
  'Pears':'🍐','Peaches':'🍑','Watermelon':'🍉','Mango':'🥭','Pineapple':'🍍',
  'Cherries':'🍒','Kiwi':'🥝','Corn':'🌽','Eggplant':'🍆','Sweet Potato':'🥔',
  'Milk':'🥛','Eggs':'🥚','Butter':'🧈','Cheese':'🧀','Yogurt':'🥛',
  'Cream':'🥛','Sour Cream':'🥛','Cream Cheese':'🧀','Heavy Cream':'🥛',
  'Mozzarella':'🧀','Parmesan':'🧀','Cheddar':'🧀',
  'Chicken':'🍗','Chicken Breast':'🍗','Ground Beef':'🥩','Beef':'🥩',
  'Salmon':'🐟','Shrimp':'🦐','Pork':'🥩','Turkey':'🦃','Tuna':'🐟',
  'Bacon':'🥓','Sausage':'🌭','Ham':'🥩','Steak':'🥩','Cod':'🐟',
  'Bread':'🍞','Bagels':'🥯','Croissants':'🥐','Baguette':'🥖',
  'Tortillas':'🫓','Rolls':'🍞','Pita':'🫓',
  'Ice Cream':'🍦','Frozen Pizza':'🍕','Pizza':'🍕','Waffles':'🧇',
  'Rice':'🍚','Pasta':'🍝','Olive Oil':'🫙','Salt':'🧂','Flour':'🌾',
  'Sugar':'🍬','Honey':'🍯','Ketchup':'🍅','Mayonnaise':'🥚',
  'Beans':'🫘','Lentils':'🫘','Chickpeas':'🫘','Oats':'🌾','Cereal':'🥣',
  'Peanut Butter':'🥜','Jam':'🍓','Chocolate':'🍫',
  'Orange Juice':'🍊','Water':'💧','Wine':'🍷','Beer':'🍺',
  'Coffee':'☕','Tea':'🍵','Juice':'🧃','Soda':'🥤',
  'Chips':'🥔','Nuts':'🥜','Crackers':'🍪','Popcorn':'🍿',
  'Almonds':'🥜','Pretzels':'🥨',
  'Dish Soap':'🧼','Paper Towels':'🧻','Toilet Paper':'🧻',
  'Laundry Detergent':'🧺','Trash Bags':'🗑️','Hand Soap':'🧼',
  'Shampoo':'🧴','Toothpaste':'🦷',
};

function productEmoji(name, category) {
  if (PRODUCT_EMOJIS[name]) return PRODUCT_EMOJIS[name];
  return CATEGORIES.find(c => c.name === category)?.emoji ?? '🛒';
}

export default function AddSheet({ onQuickAdd, onCustom, onClose, recentProducts = [] }) {
  const [query, setQuery]           = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [expanded, setExpanded]     = useState(false);
  const [addedSet, setAddedSet]     = useState(new Set());
  const inputRef = useRef(null);

  // Focus after animation starts (prevents reflow jitter)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const expand = () => { if (!expanded) setExpanded(true); };

  const capitalize = v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v;

  const handleQueryChange = val => {
    const c = capitalize(val);
    setQuery(c);
    if (c) { expand(); setSelectedCat(null); }
  };

  const handleCatSelect = cat => {
    setSelectedCat(cat);
    expand();
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleBack = () => { setSelectedCat(null); setQuery(''); };

  // Add item WITHOUT closing the sheet; flash the button briefly
  const handleAdd = (name, category) => {
    onQuickAdd(name, category);
    setAddedSet(prev => new Set([...prev, name]));
    setTimeout(() => setAddedSet(prev => {
      const n = new Set(prev); n.delete(name); return n;
    }), 900);
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
    if (!query.trim()) return { common: catData.common.slice(0, 12), rest: catData.all };
    const q = query.toLowerCase();
    const all = [...new Set([...catData.common, ...catData.all])];
    return { common: all.filter(p => p.toLowerCase().includes(q)), rest: [] };
  }, [catData, query]);

  const showSearch   = !selectedCat && query.trim().length > 0;
  const showCatView  = !!selectedCat;
  const showGrid     = !selectedCat && !query.trim();
  const recent3      = recentProducts.slice(0, 3);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={`add-sheet ${expanded ? 'full' : 'half'}`}>
        <div className="sheet-handle" />

        {showCatView ? (
          <div className="sheet-cat-header">
            <button className="back-btn" onClick={handleBack}>←</button>
            <span className="sheet-cat-title">
              {CATEGORIES.find(c => c.name === selectedCat)?.emoji} {selectedCat}
            </span>
            <button className="custom-link" onClick={() => onCustom(selectedCat)}>Custom</button>
          </div>
        ) : (
          <h2 className="sheet-title">{showSearch ? 'Results' : 'What are you adding?'}</h2>
        )}

        <div className="sheet-body">
          {/* ── Default view: recent + category grid ── */}
          {showGrid && (
            <>
              {recent3.length > 0 && (
                <QuickSection title="Recent"
                  items={recent3.map(p => ({ ...p, emoji: '🕐' }))}
                  addedSet={addedSet} onAdd={handleAdd} />
              )}
              <div className="category-grid">
                {CATEGORIES.map(({ name, emoji }) => (
                  <button key={name} className="category-tile" onClick={() => handleCatSelect(name)}>
                    <span className="cat-emoji">{emoji}</span>
                    <span className="cat-name">{name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Global search ── */}
          {showSearch && (
            <div className="product-list">
              {globalResults.map(({ name, category }) => (
                <button key={`${category}-${name}`} className="product-row"
                  onClick={() => handleAdd(name, category)}>
                  <div className="product-row-info">
                    <span className="product-name">{name}</span>
                    <span className="product-cat-badge">
                      {CATEGORIES.find(c => c.name === category)?.emoji} {category}
                    </span>
                  </div>
                  {addedSet.has(name)
                    ? <span className="product-added">✓</span>
                    : <span className="product-add">+</span>}
                </button>
              ))}
              <CustomQueryRow query={query} onAdd={n => handleAdd(n, 'Other')} />
            </div>
          )}

          {/* ── Category view ── */}
          {showCatView && (
            <div className="product-list">
              {query.trim() ? (
                <>
                  <ProductRows items={filteredCatProducts.common}
                    onAdd={n => handleAdd(n, selectedCat)} addedSet={addedSet} />
                  <CustomQueryRow query={query} onAdd={n => handleAdd(n, selectedCat)} />
                </>
              ) : (
                <>
                  {recent3.length > 0 && (
                    <QuickSection title="Recent"
                      items={recent3.map(p => ({ ...p, emoji: '🕐' }))}
                      addedSet={addedSet} onAdd={handleAdd} />
                  )}
                  <QuickSection title="Common"
                    items={filteredCatProducts.common.map(name => ({
                      name, category: selectedCat,
                      emoji: productEmoji(name, selectedCat),
                    }))}
                    addedSet={addedSet} onAdd={handleAdd} />
                  {filteredCatProducts.rest.length > 0 && (
                    <div className="product-section">
                      <p className="section-label">All</p>
                      <ProductRows items={filteredCatProducts.rest}
                        onAdd={n => handleAdd(n, selectedCat)} addedSet={addedSet} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="sheet-search-bar">
          <div className="sheet-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input ref={inputRef} className="sheet-search" type="text"
              placeholder={selectedCat ? `Search in ${selectedCat}…` : 'Search products…'}
              value={query} onChange={e => handleQueryChange(e.target.value)} />
            {query && (
              <button className="search-clear" onClick={() => handleQueryChange('')}>✕</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* Card grid — used for Recent and Common */
function QuickSection({ title, items, addedSet, onAdd }) {
  if (!items.length) return null;
  return (
    <div className="product-section">
      <p className="section-label">{title}</p>
      <div className="common-grid">
        {items.map(({ name, category, emoji }) => {
          const done = addedSet.has(name);
          return (
            <button key={name} className={`common-card ${done ? 'card-added' : ''}`}
              onClick={() => onAdd(name, category)}>
              <span className="common-card-emoji">{done ? '✓' : emoji}</span>
              <span className="common-card-name">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Plain product rows — used for "All" list */
function ProductRows({ items, onAdd, addedSet }) {
  return items.map(name => (
    <button key={name} className="product-row" onClick={() => onAdd(name)}>
      <span className="product-name">{name}</span>
      {addedSet.has(name)
        ? <span className="product-added">✓</span>
        : <span className="product-add">+</span>}
    </button>
  ));
}

function CustomQueryRow({ query, onAdd }) {
  if (!query.trim()) return null;
  return (
    <button className="product-row custom-query-row" onClick={() => onAdd(query.trim())}>
      <div className="product-row-info">
        <span className="product-name">{query.trim()}</span>
        <span className="product-cat-badge custom-hint">Tap to add this item</span>
      </div>
      <span className="product-add">+</span>
    </button>
  );
}
