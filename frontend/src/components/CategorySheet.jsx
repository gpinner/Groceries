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
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="category-sheet">
        <div className="sheet-handle" />
        <h2 className="sheet-title">What are you adding?</h2>
        <div className="category-grid">
          {CATEGORIES.map(({ name, emoji }) => (
            <button
              key={name}
              className="category-tile"
              onClick={() => onSelect(name)}
            >
              <span className="cat-emoji">{emoji}</span>
              <span className="cat-name">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
