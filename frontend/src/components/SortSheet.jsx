import { useState } from 'react';
import { STORES } from '../data/stores.js';
import './SortSheet.css';

// Alphabetically sorted for display
const SORTED_STORES = [...STORES].sort((a, b) => a.name.localeCompare(b.name));

export default function SortSheet({ sortBy, storeId, onSortChange, onStoreChange, onClose }) {
  const mode = storeId ? 'store' : sortBy;

  const selectMode = (m) => {
    if (m === 'store') {
      onSortChange('az');
      // stay open to let user pick a store
    } else {
      onStoreChange(null);
      onSortChange(m);
      onClose();
    }
  };

  const toggleStore = (id) => {
    if (storeId === id) {
      // deselect → revert to A→Z
      onStoreChange(null);
      onSortChange('az');
    } else {
      onStoreChange(id);
      onSortChange('az');
    }
    onClose();
  };

  return (
    <>
      <div className="sort-backdrop" onClick={onClose} />
      <div className="sort-panel">
        <h2 className="sort-panel-title">Order</h2>

        {/* Three-way toggle */}
        <div className="sort-toggle-group">
          <button
            className={`sort-toggle-btn ${mode === 'az' ? 'active' : ''}`}
            onClick={() => selectMode('az')}
          >
            A → Z
          </button>
          <button
            className={`sort-toggle-btn ${mode === 'recent' ? 'active' : ''}`}
            onClick={() => selectMode('recent')}
          >
            Recent
          </button>
          <button
            className={`sort-toggle-btn ${mode === 'store' ? 'active' : ''}`}
            onClick={() => selectMode('store')}
          >
            Store
          </button>
        </div>

        {/* Store grid — visible when Store mode active */}
        {mode === 'store' && (
          <div className="store-grid">
            {SORTED_STORES.map(store => (
              <StoreTile
                key={store.id}
                store={store}
                active={storeId === store.id}
                onToggle={() => toggleStore(store.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StoreTile({ store, active, onToggle }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = store.name
    .split(/[\s(&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <button className={`store-tile ${active ? 'active' : ''}`} onClick={onToggle}>
      {active && (
        <span className="store-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <div className="store-logo-wrap">
        {!imgFailed
          ? <img src={store.logo} alt={store.name} className="store-logo" onError={() => setImgFailed(true)} />
          : <span className="store-initials">{initials}</span>
        }
      </div>
      <span className="store-tile-name">{store.name}</span>
    </button>
  );
}
