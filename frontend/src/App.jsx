import { useState, useEffect, useCallback } from 'react';
import AddItemForm from './components/AddItemForm.jsx';
import CategoryGroup from './components/CategoryGroup.jsx';
import './App.css';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'checked'

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
    setItems(prev => [...prev, item].sort((a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    ));
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
    if (!res.ok) throw new Error('Failed to clear checked items');
    setItems(prev => prev.filter(item => !item.checked));
  };

  const filtered = items.filter(item => {
    if (filter === 'pending') return !item.checked;
    if (filter === 'checked') return item.checked;
    return true;
  });

  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Grocery List</h1>
        <p className="subtitle">
          {items.length === 0
            ? 'Your list is empty'
            : `${checkedCount} of ${items.length} items checked`}
        </p>
      </header>

      <AddItemForm onAdd={addItem} />

      <div className="controls">
        <div className="filter-tabs">
          {['all', 'pending', 'checked'].map(f => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {checkedCount > 0 && (
          <button className="clear-btn" onClick={clearChecked}>
            Clear checked ({checkedCount})
          </button>
        )}
      </div>

      {loading && <p className="state-msg">Loading...</p>}
      {error && <p className="state-msg error">{error}</p>}

      {!loading && !error && Object.keys(grouped).length === 0 && (
        <p className="state-msg">
          {filter === 'all' ? 'Add your first item above.' : 'No items here.'}
        </p>
      )}

      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
        <CategoryGroup
          key={category}
          category={category}
          items={items}
          onToggle={(id, checked) => updateItem(id, { checked })}
          onDelete={deleteItem}
          onUpdate={updateItem}
        />
      ))}
    </div>
  );
}
