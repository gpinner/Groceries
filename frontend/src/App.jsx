import { useState, useEffect, useCallback } from 'react';
import AddItemForm from './components/AddItemForm.jsx';
import AddSheet from './components/AddSheet.jsx';
import CategoryGroup from './components/CategoryGroup.jsx';
import BottomNav from './components/BottomNav.jsx';
import ListsSheet from './components/ListsSheet.jsx';
import VoiceModal from './components/VoiceModal.jsx';
import { useVoiceInput } from './hooks/useVoiceInput.js';
import { PRODUCTS } from './data/products.js';
import './App.css';

// Flatten product list for voice matching
const VOICE_PRODUCTS = Object.entries(PRODUCTS).flatMap(([cat, { common, all }]) =>
  [...new Set([...common, ...all])].map(name => ({ name, category: cat }))
);

function matchVoiceToProduct(transcript) {
  const t = transcript.toLowerCase().trim();
  const exact = VOICE_PRODUCTS.find(p => p.name.toLowerCase() === t);
  if (exact) return { ...exact, isKnown: true };
  const sub = VOICE_PRODUCTS
    .filter(p => t.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(t))
    .sort((a, b) => a.name.length - b.name.length);
  if (sub.length) return { ...sub[0], isKnown: true };
  return { name: transcript.charAt(0).toUpperCase() + transcript.slice(1), category: 'Other', isKnown: false };
}

const API = '/api';

const SORT_OPTIONS = [
  { id: 'az',     label: 'A → Z' },
  { id: 'za',     label: 'Z → A' },
  { id: 'recent', label: 'Recent' },
];

function sortItems(items, sortBy) {
  return [...items].sort((a, b) => {
    if (sortBy === 'az')     return a.name.localeCompare(b.name);
    if (sortBy === 'za')     return b.name.localeCompare(a.name);
    if (sortBy === 'recent') return b.created_at - a.created_at;
    return 0;
  });
}

export default function App() {
  const [lists, setLists]                   = useState([]);
  const [currentListId, setCurrentListId]   = useState(null);
  const [items, setItems]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [tab, setTab]                       = useState('all');
  const [sortBy, setSortBy]                 = useState('az');
  const voice = useVoiceInput();
  const [showSort, setShowSort]             = useState(false);
  const [sheet, setSheet]                   = useState(null);   // null | 'lists' | 'add' | 'custom'
  const [customCategory, setCustomCategory] = useState('Other');

  // Load lists once on mount
  useEffect(() => {
    fetch(`${API}/lists`)
      .then(r => r.json())
      .then(data => {
        setLists(data);
        if (data.length > 0) setCurrentListId(data[0].id);
      })
      .catch(() => setError('Failed to load lists'));
  }, []);

  // Load items whenever the current list changes
  const fetchItems = useCallback(async () => {
    if (!currentListId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/items?listId=${currentListId}`);
      if (!res.ok) throw new Error('Failed to load items');
      setItems(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentListId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── List CRUD ── */
  const createList = async (name) => {
    const res = await fetch(`${API}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const list = await res.json();
    setLists(prev => [...prev, list]);
    setCurrentListId(list.id);
    setItems([]);
  };

  const renameList = async (id, name) => {
    const res = await fetch(`${API}/lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const updated = await res.json();
    setLists(prev => prev.map(l => l.id === id ? updated : l));
  };

  const deleteList = async (id) => {
    await fetch(`${API}/lists/${id}`, { method: 'DELETE' });
    const remaining = lists.filter(l => l.id !== id);
    setLists(remaining);
    if (currentListId === id) {
      setCurrentListId(remaining[0]?.id ?? null);
      setItems([]);
    }
  };

  /* ── Item CRUD ── */
  const addItem = async (data) => {
    const res = await fetch(`${API}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, list_id: currentListId }),
    });
    if (!res.ok) throw new Error('Failed to add item');
    const item = await res.json();
    setItems(prev => [...prev, item]);
    setSheet(null);
  };

  const quickAdd = async (name, category) => {
    await addItem({ name, category, quantity: 1, unit: '' });
  };

  /* ── Voice ── */
  const handleVoiceStart = async () => {
    await voice.start((finalChunk) => {
      // Auto-match on each final recognition chunk
      const result = matchVoiceToProduct(finalChunk);
      if (result.isKnown) {
        voice.stop();
        quickAdd(result.name, result.category);
      }
    });
  };

  const handleVoiceStop = () => {
    const transcript = voice.stop();
    if (transcript) {
      const { name, category } = matchVoiceToProduct(transcript);
      quickAdd(name, category);
    }
  };

  const updateItem = async (id, changes) => {
    const res = await fetch(`${API}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    if (!res.ok) throw new Error('Failed to update item');
    const updated = await res.json();
    setItems(prev => prev.map(item => item.id === id ? updated : item));
  };

  const deleteItem = async (id) => {
    await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = async () => {
    await fetch(`${API}/items/checked/all?listId=${currentListId}`, { method: 'DELETE' });
    setItems(prev => prev.filter(item => !item.checked));
  };

  /* ── Derived data ── */
  const filtered = tab === 'done'
    ? items.filter(i => i.checked)
    : items.filter(i => !i.checked);

  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cat, catItems]) => [cat, sortItems(catItems, sortBy)]);

  const checkedCount = items.filter(i => i.checked).length;
  const pendingCount = items.filter(i => !i.checked).length;
  const currentList  = lists.find(l => l.id === currentListId);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="header-titles">
            <h1>{currentList?.name ?? 'Grocery List'}</h1>
            <p className="subtitle">
              {pendingCount === 0 && checkedCount === 0
                ? 'Your list is empty'
                : `${pendingCount} to buy · ${checkedCount} done`}
            </p>
          </div>
          <div className="header-right">
            <button
              className="sort-icon-btn"
              onClick={() => setShowSort(v => !v)}
              aria-label="Sort options"
            >
              ⇅
            </button>
            {showSort && (
              <div className="sort-dropdown">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`sort-option ${sortBy === opt.id ? 'active' : ''}`}
                    onClick={() => { setSortBy(opt.id); setShowSort(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="tab-row">
          <button
            className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            Shopping
          </button>
          <button
            className={`tab-btn ${tab === 'done' ? 'active' : ''}`}
            onClick={() => setTab('done')}
          >
            Done {checkedCount > 0 ? `(${checkedCount})` : ''}
          </button>
        </div>
      </header>

      <div className="scroll-area" onClick={() => setShowSort(false)}>
        {loading && <p className="state-msg">Loading...</p>}
        {error   && <p className="state-msg error">{error}</p>}

        {!loading && !error && sortedCategories.length === 0 && (
          <div className="state-msg">
            {tab === 'all' ? (
              <>
                <span style={{fontSize:40}}>🛒</span>
                <span style={{marginTop:8,display:'block'}}>Your list is empty</span>
                <span style={{fontSize:13,color:'#B0B8B0',marginTop:4,display:'block'}}>Tap + to add items</span>
              </>
            ) : (
              <>
                <span style={{fontSize:40}}>✅</span>
                <span style={{marginTop:8,display:'block'}}>Nothing here yet</span>
                <span style={{fontSize:13,color:'#B0B8B0',marginTop:4,display:'block'}}>Check items off your list</span>
              </>
            )}
          </div>
        )}

        {sortedCategories.map(([category, catItems]) => (
          <CategoryGroup
            key={category}
            category={category}
            items={catItems}
            onToggle={(id, checked) => updateItem(id, { checked })}
            onDelete={deleteItem}
            onUpdate={updateItem}
          />
        ))}

        {tab === 'done' && checkedCount > 0 && (
          <div className="done-actions">
            <button className="restore-all-btn" onClick={() => items.filter(i => i.checked).forEach(i => updateItem(i.id, { checked: false }))}>
              ↩ Restore all
            </button>
            <button className="clear-all-btn" onClick={clearChecked}>
              🗑️ Clear all
            </button>
          </div>
        )}
      </div>

      {sheet === 'lists' && (
        <ListsSheet
          lists={lists}
          currentListId={currentListId}
          onSwitch={id => { setCurrentListId(id); setItems([]); }}
          onCreate={createList}
          onRename={renameList}
          onDelete={deleteList}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'add' && (
        <AddSheet
          onAdd={quickAdd}
          onCustom={cat => { setCustomCategory(cat ?? 'Other'); setSheet('custom'); }}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'custom' && (
        <AddItemForm
          initialCategory={customCategory}
          onAdd={addItem}
          onCancel={() => setSheet('add')}
        />
      )}

      {voice.listening && (
        <VoiceModal
          transcript={voice.transcript}
          analyserNode={voice.analyserNode}
          onCancel={handleVoiceStop}
        />
      )}

      <BottomNav
        onAddPress={() => setSheet('add')}
        onListsPress={() => setSheet('lists')}
        onVoiceStart={handleVoiceStart}
        onVoiceStop={handleVoiceStop}
        isListening={voice.listening}
      />
    </div>
  );
}
