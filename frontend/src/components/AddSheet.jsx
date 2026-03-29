import { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS }   from '../data/products.js';
import './AddSheet.css';

// Flatten all products for global search
const ALL_PRODUCTS = Object.entries(PRODUCTS).flatMap(([cat, { common, all }]) =>
  [...new Set([...common, ...all])].map(name => ({ name, category: cat }))
);

// Build category emoji lookup from current names
const CAT_EMOJI = Object.fromEntries(CATEGORIES.map(c => [c.name, c.emoji]));

// Legacy category names that may still exist in localStorage
const LEGACY_CAT_EMOJI = {
  'Produce': '🥦',
  'Meat & Seafood': '🍗', 'Meat': '🍗', 'Seafood': '🐟',
  'Deli': '🍞', 'Bakery': '🍞',
  'Dairy': '🥛',
  'Snacks': '🍿',
  'Pantry': '🥫',
  'Beverages': '🥤', 'Drinks': '🥤',
  'Household': '🧹', 'Personal Care': '🧴',
  'Frozen': '🧊',
  'Other': '📦',
};

const PRODUCT_EMOJIS = {
  'Bananas':'🍌','Apples':'🍎','Tomatoes':'🍅','Onions':'🧅','Potatoes':'🥔',
  'Carrots':'🥕','Lettuce':'🥬','Spinach':'🥬','Avocado':'🥑','Lemons':'🍋',
  'Garlic':'🧄','Broccoli':'🥦','Cucumber':'🥒','Bell Peppers':'🫑','Mushrooms':'🍄',
  'Grapes':'🍇','Strawberries':'🍓','Oranges':'🍊','Blueberries':'🫐','Limes':'🍋',
  'Pears':'🍐','Peaches':'🍑','Watermelon':'🍉','Mango':'🥭','Mangoes':'🥭',
  'Pineapple':'🍍','Cherries':'🍒','Kiwi':'🥝','Corn':'🌽','Eggplant':'🍆',
  'Sweet Potato':'🥔','Sweet Potatoes':'🥔','Peas':'🫛','Zucchini':'🥒',
  'Radishes':'🌱','Celery':'🥬','Cauliflower':'🥦','Asparagus':'🌿',
  'Milk':'🥛','Eggs':'🥚','Butter':'🧈','Cheese':'🧀','Cheddar Cheese':'🧀',
  'Yogurt':'🥛','Sour Cream':'🥛','Cream Cheese':'🧀','Heavy Cream':'🥛',
  'Mozzarella':'🧀','Parmesan':'🧀','Greek Yogurt':'🥛','Oat Milk':'🥛',
  'Sandwich Bread':'🍞','Bread':'🍞','Bagels':'🥯','Croissants':'🥐','Baguette':'🥖',
  'Tortillas':'🫓','Rolls':'🍞','Pita Bread':'🫓','Sourdough':'🍞',
  'Chicken':'🍗','Chicken Breast':'🍗','Chicken Thighs':'🍗','Chicken Wings':'🍗',
  'Ground Beef':'🥩','Beef':'🥩','Salmon':'🐟','Shrimp':'🦐','Pork':'🥩',
  'Pork Chops':'🥩','Turkey':'🦃','Tuna':'🐟','Bacon':'🥓','Sausage':'🌭',
  'Ham':'🍖','Salami':'🍖','Turkey Slices':'🍖','Roast Beef':'🥩','Prosciutto':'🍖',
  'Ice Cream':'🍦','Frozen Pizza':'🍕','Pizza':'🍕','Frozen Waffles':'🧇',
  'French Fries':'🍟','Chicken Nuggets':'🍗','Frozen Vegetables':'🥦',
  'Rice':'🍚','Pasta':'🍝','Olive Oil':'🫙','Salt':'🧂','Flour':'🌾',
  'Sugar':'🍬','Honey':'🍯','Ketchup':'🍅','Mayonnaise':'🥚','Oats':'🌾',
  'Beans':'🫘','Lentils':'🫘','Chickpeas':'🫘','Cereal':'🥣','Peanut Butter':'🥜',
  'Canned Tomatoes':'🍅','Tomato Paste':'🍅','Soy Sauce':'🫙','Vinegar':'🫙',
  'Orange Juice':'🍊','Water':'💧','Sparkling Water':'💧','Wine':'🍷','Beer':'🍺',
  'Coffee':'☕','Tea':'🍵','Juice':'🧃','Soda':'🥤','Kombucha':'🍵',
  'Chips':'🥔','Nuts':'🥜','Mixed Nuts':'🥜','Dark Chocolate':'🍫','Chocolate':'🍫',
  'Cookies':'🍪','Crackers':'🍪','Popcorn':'🍿','Almonds':'🥜','Pretzels':'🥨',
  'Candy':'🍬','Granola Bars':'🍫','Granola':'🌾',
  'Dish Soap':'🧼','Paper Towels':'🧻','Toilet Paper':'🧻',
  'Laundry Detergent':'🧺','Trash Bags':'🗑️','Sponges':'🧽','Hand Soap':'🧼',
  'Shampoo':'🧴','Conditioner':'🧴','Toothpaste':'🦷','Deodorant':'🧴',
  'Vitamins':'💊','Protein Powder':'💪','Pet Food':'🐾','Baby Food':'🍼',
  'Ibuprofen':'💊','Hand Sanitizer':'🫧','Sunscreen':'🧴',
};

export function productEmoji(name, category) {
  if (PRODUCT_EMOJIS[name])       return PRODUCT_EMOJIS[name];
  if (CAT_EMOJI[category])        return CAT_EMOJI[category];
  if (LEGACY_CAT_EMOJI[category]) return LEGACY_CAT_EMOJI[category];
  return '🏷️';
}

function RecentChip({ name, category, done, onAdd }) {
  return (
    <button
      className={`recent-chip${done ? ' chip-added' : ''}`}
      onClick={() => onAdd(name, category)}
    >
      <span className="recent-chip-emoji">{done ? '✓' : productEmoji(name, category)}</span>
      <span className="recent-chip-name">{name}</span>
    </button>
  );
}

export default function AddSheet({ closing, onQuickAdd, onCustom, onClose, recentProducts = [] }) {
  const [query, setQuery]             = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [addedSet, setAddedSet]       = useState(new Set());
  const inputRef = useRef(null);

  // Focus search input when panel opens
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const capitalize = v => v ? v.charAt(0).toUpperCase() + v.slice(1) : v;

  const handleQueryChange = val => {
    const c = capitalize(val);
    setQuery(c);
    if (c) setSelectedCat(null);
  };

  const handleCatSelect = cat => {
    setSelectedCat(cat);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleBack = () => { setSelectedCat(null); setQuery(''); };

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

  const showSearch  = !selectedCat && query.trim().length > 0;
  const showCatView = !!selectedCat;
  const showGrid    = !selectedCat && !query.trim();
  // 25 items max, reversed so newest appears at the end of the grid
  const recent10    = recentProducts.slice(0, 10).reverse();
  const showRecent  = recent10.length > 0 && !query.trim() && !selectedCat;

  return (
    <div className={`add-panel${closing ? ' closing' : ''}`}>

      {/* ── Search bar — top of panel, always visible ── */}
      <div className="add-search-bar">
        {/* Back / close */}
        <button className="add-search-close" onClick={selectedCat ? handleBack : onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div className="add-search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            className="add-search-input"
            type="text"
            placeholder={selectedCat ? `Search in ${selectedCat}…` : 'Search products…'}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => handleQueryChange('')}>✕</button>
          )}
        </div>

        {showCatView && (
          <button className="custom-link" onClick={() => onCustom(selectedCat)}>Custom</button>
        )}
      </div>

      {/* ── Category breadcrumb when inside a category ── */}
      {showCatView && (
        <div className="add-cat-breadcrumb">
          <span className="add-cat-breadcrumb-label">
            {CAT_EMOJI[selectedCat]} {selectedCat}
          </span>
        </div>
      )}

      {/* ── Scrollable content area ── */}
      <div className="add-panel-body">

        {/* Recently added — 3-col grid, inside scrollable body, newest at end */}
        {showRecent && (
          <div className="recent-outer">
            <p className="sheet-section-label">Recently added</p>
            <div className="recent-grid">
              {recent10.map(({ name, category }) => (
                <RecentChip
                  key={name}
                  name={name}
                  category={category}
                  done={addedSet.has(name)}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </div>
        )}

        {/* Default view: categories grid */}
        {showGrid && (
          <div className="sheet-section">
            <p className="sheet-section-label">Categories</p>
            <div className="add-category-grid">
              {CATEGORIES.map(({ name, emoji }) => (
                <button key={name} className="add-category-tile" onClick={() => handleCatSelect(name)}>
                  <span className="add-cat-emoji">{emoji}</span>
                  <span className="add-cat-name">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Global search results */}
        {showSearch && (
          <div className="product-list">
            {globalResults.map(({ name, category }) => (
              <button key={`${category}-${name}`} className="product-row"
                onClick={() => handleAdd(name, category)}>
                <span className="product-row-emoji">{productEmoji(name, category)}</span>
                <div className="product-row-info">
                  <span className="product-name">{name}</span>
                  <span className="product-cat-badge">
                    {CAT_EMOJI[category] ?? '🏷️'} {category}
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

        {/* Category product view */}
        {showCatView && (
          <div className="product-list">
            {query.trim() ? (
              <>
                <CategoryProductRows
                  items={filteredCatProducts.common}
                  category={selectedCat}
                  onAdd={n => handleAdd(n, selectedCat)}
                  addedSet={addedSet}
                />
                <CustomQueryRow query={query} onAdd={n => handleAdd(n, selectedCat)} />
              </>
            ) : (
              <>
                <QuickSection
                  title="Common"
                  items={filteredCatProducts.common.map(name => ({
                    name, category: selectedCat,
                    emoji: productEmoji(name, selectedCat),
                  }))}
                  addedSet={addedSet}
                  onAdd={handleAdd}
                />
                {filteredCatProducts.rest.length > 0 && (
                  <div className="product-section">
                    <p className="section-label">All</p>
                    <CategoryProductRows
                      items={filteredCatProducts.rest}
                      category={selectedCat}
                      onAdd={n => handleAdd(n, selectedCat)}
                      addedSet={addedSet}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryProductRows({ items, category, onAdd, addedSet }) {
  return items.map(name => (
    <button key={name} className="product-row" onClick={() => onAdd(name)}>
      <span className="product-row-emoji">{productEmoji(name, category)}</span>
      <span className="product-name">{name}</span>
      {addedSet.has(name)
        ? <span className="product-added">✓</span>
        : <span className="product-add-grey">+</span>}
    </button>
  ));
}

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
