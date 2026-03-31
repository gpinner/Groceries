import { useState } from 'react';
import {
  IconSearch, IconX,
  IconLeaf, IconMilk, IconMeat, IconBread, IconSnowflake,
  IconArchive, IconBottle, IconCookie, IconHome, IconPackage,
} from '@tabler/icons-react';
import './CategorySheet.css';

export const CATEGORIES = [
  { name: 'Produce',        emoji: '🥦', Icon: IconLeaf      },
  { name: 'Dairy',          emoji: '🥛', Icon: IconMilk      },
  { name: 'Meat & Seafood', emoji: '🥩', Icon: IconMeat      },
  { name: 'Bakery',         emoji: '🍞', Icon: IconBread     },
  { name: 'Frozen',         emoji: '🧊', Icon: IconSnowflake },
  { name: 'Pantry',         emoji: '🥫', Icon: IconArchive   },
  { name: 'Beverages',      emoji: '🥤', Icon: IconBottle    },
  { name: 'Snacks',         emoji: '🍿', Icon: IconCookie    },
  { name: 'Household',      emoji: '🧹', Icon: IconHome      },
  { name: 'Other',          emoji: '📦', Icon: IconPackage   },
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
          <span className="search-icon"><IconSearch size={17} /></span>
          <input
            className="sheet-search"
            type="text"
            placeholder="Search categories…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}><IconX size={16} /></button>
          )}
        </div>

        <div className="category-grid">
          {filtered.length === 0 && (
            <p className="no-results">No categories found</p>
          )}
          {filtered.map(({ name, Icon }) => (
            <button key={name} className="category-tile" onClick={() => onSelect(name)}>
              <span className="cat-emoji"><Icon size={26} strokeWidth={1.75} /></span>
              <span className="cat-name">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
