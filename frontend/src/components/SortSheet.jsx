import { useState } from 'react';
import { STORES } from '../data/stores.js';
import './SortSheet.css';

// Alphabetically sorted for display
const SORTED_STORES = [...STORES].sort((a, b) => a.name.localeCompare(b.name));

export default function SortSheet({ sortBy, storeId, onSortChange, onStoreChange, onClose, top = 60 }) {
  const [showStores, setShowStores] = useState(!!storeId);
  const mode = showStores ? 'store' : sortBy;

  const selectMode = (m) => {
    if (m === 'store') {
      setShowStores(true);
    } else {
      setShowStores(false);
      onStoreChange(null);
      onSortChange(m);
      onClose();
    }
  };

  const toggleStore = (id) => {
    if (storeId === id) {
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
      <div className={`sort-panel${showStores ? ' expanded' : ''}`} style={{ top: `${top}px` }}>
        {/* Toggle group — fixed, does not scroll */}
        <div className="sort-panel-header">
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
        </div>

        {/* Store list — scrollable */}
        {mode === 'store' && (
          <div className="store-list">
            {SORTED_STORES.map(store => (
              <StoreRow
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

function StoreRow({ store, active, onToggle }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = store.name
    .split(/[\s(&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <button className={`store-row ${active ? 'active' : ''}`} onClick={onToggle}>
      <div className="store-logo-wrap">
        {!imgFailed
          ? <img src={store.logo} alt={store.name} className="store-logo" onError={() => setImgFailed(true)} />
          : <span className="store-initials">{initials}</span>
        }
      </div>
      <span className="store-row-name">{store.name}</span>
      {active && (
        <span className="store-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  );
}
