import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  IconSearch, IconX, IconCheck, IconPlus,
  IconLeaf, IconMilk, IconMeat, IconFish, IconBread, IconSnowflake,
  IconArchive, IconBottle, IconCookie, IconHome, IconSpray, IconPackage,
  IconTag, IconArrowLeft,
} from '@tabler/icons-react';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS }   from '../data/products.js';
import './AddSheet.css';

// Flatten all products for global search
const ALL_PRODUCTS = Object.entries(PRODUCTS).flatMap(([cat, { common, all }]) =>
  [...new Set([...common, ...all])].map(name => ({ name, category: cat }))
);

// Build category emoji lookup from current names (kept for productEmoji fallback)
const CAT_EMOJI = Object.fromEntries(CATEGORIES.map(c => [c.name, c.emoji]));

// Build category icon lookup from current names
const CAT_ICON = Object.fromEntries(CATEGORIES.map(c => [c.name, c.Icon]));

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

const LEGACY_CAT_ICON = {
  'Produce': IconLeaf,
  'Meat & Seafood': IconMeat, 'Meat': IconMeat,
  'Seafood': IconFish,
  'Deli': IconBread, 'Bakery': IconBread,
  'Dairy': IconMilk,
  'Snacks': IconCookie,
  'Pantry': IconArchive,
  'Beverages': IconBottle, 'Drinks': IconBottle,
  'Household': IconHome,
  'Personal Care': IconSpray,
  'Frozen': IconSnowflake,
  'Other': IconPackage,
};

function getCategoryIcon(cat) {
  return CAT_ICON[cat] ?? LEGACY_CAT_ICON[cat] ?? IconTag;
}

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

// Phases: visible → checking (✓ shown) → fading (fade to 0 over 3s) → replaced by incoming
function RecSlot({ name, category, phase, onAdd }) {
  const interactive = phase === 'visible' || phase === 'incoming';
  return (
    <button
      className={`recent-chip phase-${phase}`}
      onClick={interactive ? () => onAdd(name, category) : undefined}
      disabled={!interactive}
    >
      <span className="recent-chip-emoji">
        {phase === 'checking' ? <IconCheck size={16} /> : productEmoji(name, category)}
      </span>
      <span className="recent-chip-name">{name}</span>
    </button>
  );
}

const VISIBLE_RECS = 8;

export default function AddSheet({ closing, onQuickAdd, onCustom, onClose, recommendations = [] }) {
  const [query, setQuery]             = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [addedSet, setAddedSet]       = useState(new Set());
  const inputRef = useRef(null);

  // ── Recommendation slots ─────────────────────────────────────────────────
  // Stable list of 8 positions. Each slot has { name, category, phase }.
  // Phases: 'visible' → 'checking' → 'fading' → replaced with 'incoming' → 'visible'
  const [slots, setSlots] = useState(() =>
    recommendations.slice(0, VISIBLE_RECS).map(r => ({
      name: r.name, category: r.category, phase: 'visible',
    }))
  );
  // Always-fresh ref so setTimeout callbacks never use stale recommendations
  const recRef = useRef(recommendations);
  useEffect(() => { recRef.current = recommendations; }, [recommendations]);

  const handleRecAdd = useCallback((name, category) => {
    onQuickAdd(name, category); // trackProduct called immediately inside quickAdd

    // 1. Show ✓ checkmark
    setSlots(prev => prev.map(s => s.name === name ? { ...s, phase: 'checking' } : s));

    // 2. After 900ms: start 3s fade-out (50% → 0)
    setTimeout(() => {
      setSlots(prev => prev.map(s => s.name === name ? { ...s, phase: 'fading' } : s));
    }, 900);

    // 3. After fade completes: replace slot with next recommendation
    setTimeout(() => {
      setSlots(prev => {
        // Names of slots still active (not the one we're replacing)
        const activeNames = new Set(
          prev.filter(s => s.name !== name).map(s => s.name)
        );
        // Pick first rec not already visible in another slot
        const next = recRef.current.find(r => !activeNames.has(r.name));
        const updated = prev.map(s => {
          if (s.name !== name) return s;
          return next
            ? { name: next.name, category: next.category, phase: 'incoming' }
            : null;
        }).filter(Boolean);
        return updated;
      });

      // 4. After fade-in completes: mark slot as visible
      setTimeout(() => {
        setSlots(prev => prev.map(s =>
          s.phase === 'incoming' ? { ...s, phase: 'visible' } : s
        ));
      }, 550);
    }, 900 + 3000);
  }, [onQuickAdd]);
  // ─────────────────────────────────────────────────────────────────────────

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
  const showRec     = slots.length > 0 && !query.trim() && !selectedCat;

  return (
    <div className={`add-panel${closing ? ' closing' : ''}`}>

      {/* ── Search bar — top of panel, always visible ── */}
      <div className="add-search-bar">
        {/* Back / close */}
        <button className="add-search-close" onClick={selectedCat ? handleBack : onClose} aria-label="Close">
          <IconArrowLeft size={20} />
        </button>

        <div className="add-search-wrap">
          <IconSearch className="search-icon" size={18} />
          <input
            ref={inputRef}
            className="add-search-input"
            type="text"
            placeholder={selectedCat ? `Search in ${selectedCat}…` : 'Search products…'}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => handleQueryChange('')}><IconX size={16} /></button>
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
            {(() => { const Ci = getCategoryIcon(selectedCat); return <Ci size={16} />; })()} {selectedCat}
          </span>
        </div>
      )}

      {/* ── Scrollable content area ── */}
      <div className="add-panel-body">

        {/* Recommended — stable slot grid with per-slot phase animations */}
        {showRec && (
          <div className="recent-outer">
            <p className="sheet-section-label">Recommended</p>
            <div className="recent-grid">
              {slots.map(({ name, category, phase }) => (
                <RecSlot
                  key={name}
                  name={name}
                  category={category}
                  phase={phase}
                  onAdd={handleRecAdd}
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
              {CATEGORIES.map(({ name, Icon }) => (
                <button key={name} className="add-category-tile" onClick={() => handleCatSelect(name)}>
                  <span className="add-cat-emoji"><Icon size={26} strokeWidth={1.75} /></span>
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
                    <span style={{display:'inline-flex',verticalAlign:'middle'}}>{(() => { const Ci = getCategoryIcon(category); return <Ci size={14} />; })()}</span> {category}
                  </span>
                </div>
                {addedSet.has(name)
                  ? <span className="product-added"><IconCheck size={16} /></span>
                  : <span className="product-add"><IconPlus size={16} /></span>}
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
        ? <span className="product-added"><IconCheck size={16} /></span>
        : <span className="product-add-grey"><IconPlus size={16} /></span>}
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
              <span className="common-card-emoji">{done ? <IconCheck size={18} /> : emoji}</span>
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
      <span className="product-add"><IconPlus size={16} /></span>
    </button>
  );
}
