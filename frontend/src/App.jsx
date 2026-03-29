import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import AddItemForm from './components/AddItemForm.jsx';
import AddSheet from './components/AddSheet.jsx';
import CategoryGroup from './components/CategoryGroup.jsx';
import BottomNav from './components/BottomNav.jsx';
import ListsSheet from './components/ListsSheet.jsx';
import SortSheet from './components/SortSheet.jsx';
import UserDrawer from './components/UserDrawer.jsx';
import VoiceModal from './components/VoiceModal.jsx';
import { useVoiceInput } from './hooks/useVoiceInput.js';
import { PRODUCTS } from './data/products.js';
import { STORES } from './data/stores.js';
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

// Dev user — will be replaced by real auth later
const CURRENT_USER = { id: 1, name: 'Greg Pin', email: 'greg@example.com' };

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

function sortCategories(grouped, sortBy, storeId) {
  const store = storeId ? STORES.find(s => s.id === storeId) : null;
  return Object.entries(grouped).sort(([a], [b]) => {
    if (store) {
      const ai = store.layout.indexOf(a);
      const bi = store.layout.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
    if (sortBy === 'az') return a.localeCompare(b);
    if (sortBy === 'za') return b.localeCompare(a);
    return 0;
  });
}

const LS_KEY        = `groceries_listId_u${CURRENT_USER.id}`;
const LS_RECENT_KEY = `groceries_recent_u${CURRENT_USER.id}`;

export default function App() {
  const [lists, setLists]                   = useState([]);
  const [currentListId, setCurrentListId]   = useState(null);
  const [items, setItems]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [tab, setTab]                       = useState('all');
  const [sortBy, setSortBy]                 = useState('az');
  const [storeId, setStoreId]               = useState(null);
  const [exitingIds, setExitingIds]         = useState(new Set());
  const [thumbAnim, setThumbAnim]           = useState(null);
  const [undoItems, setUndoItems]           = useState(null);
  const undoTimerRef                        = useRef(null);
  const [recentProducts, setRecentProducts] = useState(() => {
    try { const d = localStorage.getItem(LS_RECENT_KEY); return d ? JSON.parse(d) : []; }
    catch { return []; }
  });
  const voice = useVoiceInput();
  const [sheet, setSheet]                   = useState(null);   // null | 'lists' | 'add' | 'custom' | 'sort' | 'user'
  const [customCategory, setCustomCategory] = useState('Other');
  const [editingListName, setEditingListName] = useState(false);
  const [tempListName, setTempListName]       = useState('');
  const sortBtnRef                          = useRef(null);
  const appRef                              = useRef(null);
  const [sortPanelTop, setSortPanelTop]     = useState(60);

  // Persist current list ID across reloads
  const switchList = (id) => {
    setCurrentListId(id);
    try { localStorage.setItem(LS_KEY, String(id)); } catch {}
  };

  // Load lists for the current user on mount
  useEffect(() => {
    fetch(`${API}/lists?userId=${CURRENT_USER.id}`)
      .then(r => r.json())
      .then(data => {
        setLists(data);
        if (data.length === 0) return;
        // Restore last-used list, fall back to first
        const saved = (() => { try { return localStorage.getItem(LS_KEY); } catch { return null; } })();
        const match = saved && data.find(l => l.id === Number(saved));
        setCurrentListId(match ? match.id : data[0].id);
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
      body: JSON.stringify({ name, userId: CURRENT_USER.id }),
    });
    const list = await res.json();
    setLists(prev => [...prev, list]);
    switchList(list.id);
    setItems([]);
  };

  const renameList = async (id, name) => {
    // Optimistic update immediately so the user sees the change
    setLists(prev => prev.map(l => l.id === id ? { ...l, name } : l));
    try {
      const res = await fetch(`${API}/lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('rename failed');
      const updated = await res.json();
      setLists(prev => prev.map(l => l.id === id ? updated : l));
    } catch {
      // Revert by re-fetching the real state
      fetch(`${API}/lists?userId=${CURRENT_USER.id}`).then(r => r.json()).then(setLists).catch(() => {});
    }
  };

  const deleteList = async (id) => {
    await fetch(`${API}/lists/${id}`, { method: 'DELETE' });
    const remaining = lists.filter(l => l.id !== id);
    setLists(remaining);
    if (currentListId === id) {
      switchList(remaining[0]?.id ?? null);
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

  // Quick-add from the sheet — does NOT close the sheet
  const quickAdd = async (name, category) => {
    const res = await fetch(`${API}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, quantity: 1, unit: '', list_id: currentListId }),
    });
    if (!res.ok) return;
    const item = await res.json();
    setItems(prev => [...prev, item]);
    // Track in recent products (deduplicate, keep newest first, max 20)
    setRecentProducts(prev => {
      const next = [{ name, category }, ...prev.filter(p => p.name !== name)].slice(0, 20);
      try { localStorage.setItem(LS_RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
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

  /* Toggle checked — optimistic update, then confirm from DB response */
  const toggleChecked = async (id, checked) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked } : i));
    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked }),
      });
      if (!res.ok) throw new Error('API error ' + res.status);
      const saved = await res.json();
      // Verify the DB actually saved the value we sent
      if (Boolean(saved.checked) !== checked) {
        console.error('DB did not persist checked value', { expected: checked, got: saved.checked });
        throw new Error('checked mismatch');
      }
      setItems(prev => prev.map(i => i.id === id ? saved : i));
    } catch (err) {
      console.error('toggleChecked failed:', err);
      // Revert optimistic update on any failure
      setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !checked } : i));
    }
  };

  /* Check with animation — keeps item visible in shopping list during exit animation */
  const checkItem = (id, pos) => {
    // Add to exitingIds so it stays in the shopping filter during animation
    setExitingIds(prev => new Set([...prev, id]));
    // Show thumb emoji portal
    if (pos) {
      setThumbAnim(pos);
      setTimeout(() => setThumbAnim(null), 750);
    }
    // Immediately update DB + optimistic state
    toggleChecked(id, true);
    // Remove from exitingIds after animation completes (440ms collapse + 40ms buffer)
    setTimeout(() => {
      setExitingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 480);
  };

  const updateItem = async (id, changes) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error('Failed to update item');
      const updated = await res.json();
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (e) {
      // Revert optimistic update on failure
      fetchItems();
    }
  };

  const deleteItem = async (id) => {
    await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    const cleared = items.filter(i => i.checked);
    if (!cleared.length) return;
    // Remove from UI immediately
    setItems(prev => prev.filter(i => !i.checked));
    setUndoItems(cleared);
    // Cancel any pending undo timer
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    // Commit delete to DB after 5 s (unless undo is pressed)
    undoTimerRef.current = setTimeout(async () => {
      setUndoItems(null);
      try {
        const res = await fetch(`${API}/items?listId=${currentListId}&checked=true`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } catch {
        fetchItems();
      }
    }, 5000);
  };

  const undoClear = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoItems) {
      setItems(prev => [...prev, ...undoItems]);
      setUndoItems(null);
    }
  };

  /* ── Derived data ── */
  const filtered = tab === 'done'
    ? items.filter(i => i.checked)
    : items.filter(i => !i.checked || exitingIds.has(i.id));

  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sortedCategories = sortCategories(grouped, sortBy, storeId)
    .map(([cat, catItems]) => [cat, sortItems(catItems, sortBy)]);

  const checkedCount = items.filter(i => i.checked).length;
  const pendingCount = items.filter(i => !i.checked).length;
  const currentList  = lists.find(l => l.id === currentListId);

  return (
    <div className="app" ref={appRef}>
      <header className="app-header">
        <div className="header-top">
          <div className="header-titles">
            {editingListName ? (
              <input
                className="list-title-input"
                value={tempListName}
                onChange={e => setTempListName(e.target.value)}
                onBlur={() => {
                  if (tempListName.trim()) renameList(currentListId, tempListName.trim());
                  setEditingListName(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { if (tempListName.trim()) renameList(currentListId, tempListName.trim()); setEditingListName(false); }
                  if (e.key === 'Escape') setEditingListName(false);
                }}
                autoFocus
              />
            ) : (
              <h1
                className="list-title-editable"
                onClick={() => { setTempListName(currentList?.name ?? ''); setEditingListName(true); }}
              >
                {currentList?.name ?? 'Grocery List'}
                <span className="list-title-edit-hint">✏</span>
              </h1>
            )}
          </div>
          <div className="header-right">
            <button
              ref={sortBtnRef}
              className={`sort-icon-btn ${storeId ? 'store-active' : ''}`}
              onClick={() => {
                if (sortBtnRef.current && appRef.current) {
                  const btnRect = sortBtnRef.current.getBoundingClientRect();
                  const appRect = appRef.current.getBoundingClientRect();
                  setSortPanelTop(Math.round(btnRect.bottom - appRect.top) + 8);
                }
                setSheet('sort');
              }}
              aria-label="Sort / store layout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="9" y1="18" x2="15" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="tab-row">
          <button
            className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            Shopping
            {pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
          </button>
          <button
            className={`tab-btn ${tab === 'done' ? 'active' : ''}`}
            onClick={() => setTab('done')}
          >
            Done
            {checkedCount > 0 && <span className="tab-count">{checkedCount}</span>}
          </button>
        </div>
      </header>

      <div className="scroll-area">
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
            onToggle={toggleChecked}
            onCheck={checkItem}
            onDelete={deleteItem}
            onUpdate={updateItem}
          />
        ))}

      </div>

      {tab === 'done' && checkedCount > 0 && (
        <div className="done-footer">
          <div className="done-footer-gradient" />
          <div className="done-footer-buttons">
            <button className="restore-all-btn" onClick={() => items.filter(i => i.checked).forEach(i => toggleChecked(i.id, false))}>
              ↩ Restore all
            </button>
            <button className="clear-all-btn" onClick={clearChecked}>
              Clear all
            </button>
          </div>
        </div>
      )}

      {undoItems && (
        <button className="undo-clear-btn" onClick={undoClear}>
          ↩ Undo Clear all
        </button>
      )}

      {sheet === 'sort' && (
        <SortSheet
          sortBy={sortBy}
          storeId={storeId}
          onSortChange={setSortBy}
          onStoreChange={setStoreId}
          onClose={() => setSheet(null)}
          top={sortPanelTop}
        />
      )}

      {sheet === 'lists' && (
        <ListsSheet
          lists={lists}
          currentListId={currentListId}
          onSwitch={id => { switchList(id); setItems([]); }}
          onCreate={createList}
          onRename={renameList}
          onDelete={deleteList}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'add' && (
        <AddSheet
          onQuickAdd={quickAdd}
          onCustom={cat => { setCustomCategory(cat ?? 'Other'); setSheet('custom'); }}
          onClose={() => setSheet(null)}
          recentProducts={recentProducts}
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

      {sheet === 'user' && (
        <UserDrawer
          user={CURRENT_USER}
          onClose={() => setSheet(null)}
        />
      )}

      <BottomNav
        onAddPress={() => setSheet('add')}
        onListsPress={() => setSheet('lists')}
        onUserPress={() => setSheet('user')}
        onVoiceStart={handleVoiceStart}
        onVoiceStop={handleVoiceStop}
        isListening={voice.listening}
      />

      {thumbAnim && createPortal(
        <span
          className="thumb-emoji-portal"
          style={{ left: thumbAnim.x, top: thumbAnim.y }}
        >👍</span>,
        document.getElementById('root') ?? document.body
      )}
    </div>
  );
}
