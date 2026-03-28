import { useState, useEffect, useCallback } from 'react';
import AddItemForm from './components/AddItemForm.jsx';
import CategorySheet from './components/CategorySheet.jsx';
import CategoryGroup from './components/CategoryGroup.jsx';
import BottomNav from './components/BottomNav.jsx';
import './App.css';

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
  const [items, setItems]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [tab, setTab]                       = useState('all');      // 'all' | 'checked'
  const [sortBy, setSortBy]                 = useState('az');
  const [sheet, setSheet]                   = useState(null);       // null | 'category' | 'add'
  const [selectedCategory, setSelectedCategory] = useState('Other');

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}/items`);
      if (!res.ok) throw new Error('Failed to load items');
      setItems(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (data) => {
    const res = await fetch(`${API}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add item');
    const item = await res.json();
    setItems(prev => [...prev, item]);
    setSheet(null);
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
    const res = await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = async () => {
    const res = await fetch(`${API}/items/checked/all`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear items');
    setItems(prev => prev.filter(item => !item.checked));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSheet('add');
  };

  // Filter by tab, group by category, sort items within each group
  const filtered = tab === 'checked'
    ? items.filter(i => i.checked)
    : items.filter(i => !i.checked);

  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, catItems]) => [category, sortItems(catItems, sortBy)]);

  const checkedCount = items.filter(i => i.checked).length;
  const pendingCount = items.filter(i => !i.checked).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>Grocery List</h1>
            <p className="subtitle">
              {pendingCount === 0 && checkedCount === 0
                ? 'Your list is empty'
                : `${pendingCount} to buy · ${checkedCount} done`}
            </p>
          </div>
        </div>
        <div className="sort-bar">
          <span className="sort-label">Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`sort-btn ${sortBy === opt.id ? 'active' : ''}`}
              onClick={() => setSortBy(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className="scroll-area">
        {loading && <p className="state-msg">Loading...</p>}
        {error && <p className="state-msg error">{error}</p>}

        {!loading && !error && sortedCategories.length === 0 && (
          <p className="state-msg">
            {tab === 'all' ? 'Tap + to add your first item.' : 'Nothing done yet.'}
          </p>
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

        {tab === 'checked' && checkedCount > 0 && (
          <button className="clear-all-btn" onClick={clearChecked}>
            🗑️ Clear all done items
          </button>
        )}
      </div>

      {sheet === 'category' && (
        <CategorySheet
          onSelect={handleCategorySelect}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'add' && (
        <AddItemForm
          initialCategory={selectedCategory}
          onAdd={addItem}
          onCancel={() => setSheet('category')}
        />
      )}

      <BottomNav
        activeTab={tab}
        onTabChange={setTab}
        onAddPress={() => setSheet('category')}
      />
    </div>
  );
}
