import { useState } from 'react';
import './ListsSheet.css';

export default function ListsSheet({ lists, currentListId, onSwitch, onCreate, onRename, onDelete, onClose }) {
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState('New List');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');

  const handleCreate = async () => {
    await onCreate(newName.trim() || 'New List');
    setCreating(false);
    setNewName('New List');
  };

  const startEdit = (list) => {
    setEditingId(list.id);
    setEditName(list.name);
  };

  const handleRename = async (id) => {
    await onRename(id, editName.trim() || 'New List');
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (lists.length === 1) return; // must keep at least one list
    await onDelete(id);
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="lists-sheet">
        <div className="sheet-handle" />
        <h2 className="sheet-title">My Lists</h2>

        <ul className="lists-ul">
          {lists.map(list => (
            <li key={list.id} className={`list-item ${list.id === currentListId ? 'active' : ''}`}>
              {editingId === list.id ? (
                <div className="list-edit-row">
                  <input
                    className="list-name-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(list.id)}
                    autoFocus
                  />
                  <button className="list-save-btn" onClick={() => handleRename(list.id)}>Save</button>
                  <button className="list-cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                </div>
              ) : (
                <>
                  <button className="list-name-btn" onClick={() => { onSwitch(list.id); onClose(); }}>
                    <span className="list-check">{list.id === currentListId ? '✓' : ''}</span>
                    <span className="list-name">{list.name}</span>
                  </button>
                  <div className="list-actions">
                    <button className="list-icon-btn" onClick={() => startEdit(list)} title="Rename">✏️</button>
                    <button
                      className="list-icon-btn delete"
                      onClick={() => handleDelete(list.id)}
                      disabled={lists.length === 1}
                      title="Delete"
                    >🗑️</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {creating ? (
          <div className="create-row">
            <input
              className="list-name-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              placeholder="List name"
            />
            <button className="list-save-btn" onClick={handleCreate}>Create</button>
            <button className="list-cancel-btn" onClick={() => { setCreating(false); setNewName('New List'); }}>✕</button>
          </div>
        ) : (
          <button className="new-list-btn" onClick={() => setCreating(true)}>
            + New List
          </button>
        )}
      </div>
    </>
  );
}
