import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { POPULAR_PRODUCTS } from './data/popularProducts.js';
import { getRecommendations } from './utils/recommendations.js';
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

const LS_KEY         = `groceries_listId_u${CURRENT_USER.id}`;
const LS_PRODS_KEY   = `groceries_prods_u${CURRENT_USER.id}`;
const LS_RECENT_KEY  = `groceries_recent_u${CURRENT_USER.id}`; // legacy — migrated below

export default function App() {
  const [view, setView]                     = useState('home'); // 'home' | 'list'
  const [lists, setLists]                   = useState([]);
  const [listStats, setListStats]           = useState({});    // { [listId]: { shopping, done } }
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
  // Tracked products: { name, category, addCount, lastAdded, firstAdded }
  // Migrates automatically from old flat { name, category } recent format.
  const [trackedProducts, setTrackedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_PRODS_KEY);
      if (saved) return JSON.parse(saved);

      // Migrate old recent list — spread timestamps over past weeks so the
      // scoring function has realistic data to work with immediately.
      const old = localStorage.getItem(LS_RECENT_KEY);
      if (old) {
        const migrated = JSON.parse(old).map((p, i) => ({
          name:       p.name,
          category:   p.category,
          addCount:   2,
          lastAdded:  Date.now() - (i + 1) * 8 * 86_400_000, // ~weekly spacing
          firstAdded: Date.now() - (i + 2) * 8 * 86_400_000,
        }));
        localStorage.setItem(LS_PRODS_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return [];
    } catch { return []; }
  });

  // Recommendations: derived from trackedProducts + popular defaults.
  // Re-evaluated any time trackedProducts changes (e.g. after a quick-add).
  const recommendations = useMemo(
    () => getRecommendations(trackedProducts, POPULAR_PRODUCTS),
    [trackedProducts]
  );
  const voice = useVoiceInput();
  const [sheet, setSheet]                   = useState(null);
  const [addPanelClosing, setAddPanelClosing] = useState(false);
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

  // Navigate into a list
  const openList = (id) => {
    switchList(id);
    setItems([]);
    setTab('all');
    setView('list');
  };

  // Load lists for the current user on mount
  useEffect(() => {
    fetch(`${API}/lists?userId=${CURRENT_USER.id}`)
      .then(r => r.json())
      .then(data => {
        setLists(data);
        if (data.length === 0) { setLoading(false); return; }
        // Restore last-used list, fall back to first (but stay on home view)
        const saved = (() => { try { return localStorage.getItem(LS_KEY); } catch { return null; } })();
        const match = saved && data.find(l => l.id === Number(saved));
        setCurrentListId(match ? match.id : data[0].id);
      })
      .catch(() => { setError('Failed to load lists'); setLoading(false); });
  }, []);

  // Load item counts for ALL lists when on home view
  useEffect(() => {
    if (view !== 'home' || lists.length === 0) return;
    const ctrl = new AbortController();
    Promise.all(
      lists.map(async (list) => {
        try {
          const r = await fetch(`${API}/items?listId=${list.id}`, { signal: ctrl.signal });
          const its = await r.json();
          return [list.id, {
            shopping: its.filter(i => !i.checked).length,
            done:     its.filter(i => i.checked).length,
          }];
        } catch { return [list.id, { shopping: 0, done: 0 }]; }
      })
    ).then(entries => {
      if (!ctrl.signal.aborted) setListStats(Object.fromEntries(entries));
    });
    return () => ctrl.abort();
  }, [view, lists]);

  // Load items whenever the current list changes (and we're in list view)
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
    openList(list.id);
  };

  const renameList = async (id, name) => {
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

  // Slide the add panel out then close — called by tab-button click or ← button
  const closeAddPanel = () => {
    setAddPanelClosing(true);
    setTimeout(() => {
      setSheet(null);
      setAddPanelClosing(false);
    }, 260);
  };

  const trackProduct = (name, category) => {
    setTrackedProducts(prev => {
      const now     = Date.now();
      const existing = prev.find(p => p.name === name);
      let next;
      if (existing) {
        next = prev.map(p => p.name === name
          ? { ...p, addCount: p.addCount + 1, lastAdded: now }
          : p
        );
      } else {
        next = [{ name, category, addCount: 1, lastAdded: now, firstAdded: now }, ...prev];
      }
      // Keep max 100 products sorted by most recently added
      next = next.sort((a, b) => b.lastAdded - a.lastAdded).slice(0, 100);
      try { localStorage.setItem(LS_PRODS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Quick-add: if same product already exists unchecked, increment its qty instead
  const quickAdd = async (name, category) => {
    const existing = items.find(i => i.name === name && !i.checked);
    if (existing) {
      await updateItem(existing.id, { quantity: (Number(existing.quantity) || 1) + 1 });
      trackProduct(name, category);
      return;
    }
    const res = await fetch(`${API}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, quantity: 1, unit: '', list_id: currentListId }),
    });
    if (!res.ok) return;
    const item = await res.json();
    setItems(prev => [...prev, item]);
    trackProduct(name, category);
  };

  /* ── Voice ── */
  const handleVoiceStart = async () => {
    await voice.start((finalChunk) => {
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
      if (Boolean(saved.checked) !== checked) throw new Error('checked mismatch');
      setItems(prev => prev.map(i => i.id === id ? saved : i));
    } catch (err) {
      console.error('toggleChecked failed:', err);
      setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !checked } : i));
    }
  };

  /* Check with animation */
  const checkItem = (id, pos) => {
    setExitingIds(prev => new Set([...prev, id]));
    if (pos) {
      setThumbAnim(pos);
      setTimeout(() => setThumbAnim(null), 750);
    }
    toggleChecked(id, true);
    setTimeout(() => {
      setExitingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 480);
  };

  const updateItem = async (id, changes) => {
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
    } catch {
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
    setItems(prev => prev.filter(i => !i.checked));
    setUndoItems(cleared);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
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

  /* ── Derived data (list view) ── */
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

      {/* ════════════════════════════════════════
          HOME VIEW — lists overview
      ════════════════════════════════════════ */}
      {view === 'home' && (
        <>
          <div className="home-header">
            <h1 className="home-title">My Lists</h1>
          </div>

          <div className="home-body">
            {lists.length === 0 ? (
              <div className="home-empty">
                <span className="home-empty-icon">🛒</span>
                <p className="home-empty-text">No lists yet</p>
                <p className="home-empty-hint">Tap the button below to create your first list</p>
              </div>
            ) : (
              <div className="home-lists">
                {lists.map(list => {
                  const stats = listStats[list.id];
                  return (
                    <button key={list.id} className="list-card" onClick={() => openList(list.id)}>
                      <span className="list-card-name">{list.name}</span>
                      <div className="list-card-badges">
                        <span className="list-badge list-badge-shopping">
                          {stats ? stats.shopping : '—'}
                        </span>
                        <span className="list-badge list-badge-done">
                          {stats ? stats.done : '—'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              className="new-list-btn"
              onClick={() => createList(`Shopping List ${lists.length + 1}`)}
            >
              + New List
            </button>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════
          LIST VIEW — shopping / done
      ════════════════════════════════════════ */}
      {view === 'list' && (
        <>
          <header className="app-header">
            <div className="header-top">
              {/* Back arrow → returns to home */}
              <button className="back-home-btn" onClick={() => setView('home')} aria-label="Back to lists">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
              </button>

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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6"  x2="21" y2="6" />
                    <line x1="6" y1="12" x2="18" y2="12" />
                    <line x1="9" y1="18" x2="15" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="tab-row">
              {/* Clicking Shopping/Done while add panel is open closes it */}
              <button
                className={`tab-btn ${tab === 'all' && sheet !== 'add' && !addPanelClosing ? 'active' : ''}`}
                onClick={() => { if (sheet === 'add' || addPanelClosing) { closeAddPanel(); } else { setTab('all'); } }}
              >
                Shopping
                {pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
              </button>
              <button
                className={`tab-btn ${tab === 'done' && sheet !== 'add' && !addPanelClosing ? 'active' : ''}`}
                onClick={() => { if (sheet === 'add' || addPanelClosing) { closeAddPanel(); } else { setTab('done'); } }}
              >
                Done
                {checkedCount > 0 && <span className="tab-count">{checkedCount}</span>}
              </button>
            </div>
          </header>

          {/* Add panel replaces the list — inline, no overlay */}
          {(sheet === 'add' || addPanelClosing) ? (
            <AddSheet
              closing={addPanelClosing}
              onQuickAdd={quickAdd}
              onCustom={cat => { setCustomCategory(cat ?? 'Other'); setSheet('custom'); }}
              onClose={closeAddPanel}
              recommendations={recommendations}
            />
          ) : (
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
          )}

          {tab === 'done' && checkedCount > 0 && (
            <div className="done-footer">
              <div className="done-footer-gradient" />
              <div className="done-footer-buttons">
                <button className="restore-all-btn"
                  onClick={() => items.filter(i => i.checked).forEach(i => toggleChecked(i.id, false))}>
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
        </>
      )}

      {/* ── Sheets (accessible from both views) ── */}
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

      {/* ── Bottom navigation ── */}
      <BottomNav
        view={view}
        onAddPress={() => setSheet('add')}
        onGoHome={() => setView('home')}
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
