import { useState } from 'react';
import { STORES } from '../data/stores.js';
import './SortSheet.css';

export default function SortSheet({ sortBy, storeId, onSortChange, onStoreChange, onClose }) {
  // Derive current mode for the toggle
  const mode = storeId ? 'store' : sortBy;

  const selectMode = (m) => {
    if (m === 'store') {
      // Enter store mode — keep whichever store was last selected (or none)
      onSortChange('az');       // items within category still A→Z
    } else {
      onStoreChange(null);
      onSortChange(m);
      onClose();
    }
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sort-sheet">
        <div className="sheet-handle" />
        <h2 className="sort-sheet-title">Order</h2>

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

        {/* Store grid — only shown in store mode */}
        {mode === 'store' && (
          <div className="store-grid">
            {STORES.map(store => (
              <StoreTile
                key={store.id}
                store={store}
                active={storeId === store.id}
                onSelect={() => { onStoreChange(store.id); onClose(); }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StoreTile({ store, active, onSelect }) {
  const [imgFailed, setImgFailed] = useState(false);
  // Initials fallback: first letters of each word, max 2
  const initials = store.name
    .split(/[\s(&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <button
      className={`store-tile ${active ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="store-logo-wrap">
        {!imgFailed ? (
          <img
            src={store.logo}
            alt={store.name}
            className="store-logo"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="store-initials">{initials}</span>
        )}
      </div>
      <span className="store-tile-name">{store.name}</span>
    </button>
  );
}
