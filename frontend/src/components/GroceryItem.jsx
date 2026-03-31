import { useState, useRef, useEffect } from 'react';
import { IconPencil, IconTrash, IconPlus, IconMinus, IconCheck, IconArrowBackUp } from '@tabler/icons-react';
import './GroceryItem.css';

const UNITS = ['', 'pc', 'lb', 'oz', 'kg', 'g', 'L', 'mL', 'dozen', 'pack', 'can', 'bag', 'box'];

export default function GroceryItem({ item, onToggle, onCheck, onDelete, onUpdate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [qty, setQty]           = useState(item.quantity);
  const [editing, setEditing]   = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [saving, setSaving]     = useState(false);
  const [dimmed, setDimmed]     = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const circleRef = useRef(null);

  // Sync qty if item changes externally
  if (qty !== item.quantity && !menuOpen) setQty(item.quantity);

  // Reset animation state if the check was reverted (e.g. API failure)
  // Without this, dimmed+collapsing CSS makes the item invisible forever
  useEffect(() => {
    if (!item.checked && (dimmed || collapsing)) {
      setDimmed(false);
      setCollapsing(false);
    }
  }, [item.checked]);

  const changeQty = async (next) => {
    const n = Math.max(0.5, Number((next).toFixed(1)));
    setQty(n);
    onUpdate(item.id, { quantity: n });
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await onUpdate(item.id, { name: editName.trim() });
      setEditing(false);
    } finally { setSaving(false); }
  };

  /* ── Check with animation ── */
  const handleCheckClick = () => {
    if (item.checked) {
      onToggle(item.id, false);
      return;
    }
    // Capture circle position for the portal thumb (rendered in App)
    const pos = circleRef.current ? (() => {
      const r = circleRef.current.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })() : null;
    // Immediately grey out and start collapse animation
    setDimmed(true);
    setCollapsing(true);
    // Fire up to App to update DB + manage portal + filter
    onCheck(item.id, pos);
  };

  const qtyLabel = `${item.quantity}${item.unit ? '\u202f' + item.unit : ''}`;

  if (editing) {
    return (
      <li className="grocery-item editing">
        <input
          className="edit-name"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSaveName()}
        />
        <div className="edit-actions">
          <button className="save-btn" onClick={handleSaveName} disabled={saving || !editName.trim()}>
            {saving ? '…' : 'Save'}
          </button>
          <button className="cancel-btn" onClick={() => { setEditName(item.name); setEditing(false); }}>
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <>
      <li className={`grocery-item ${item.checked ? 'checked' : ''} ${menuOpen ? 'menu-open' : ''} ${dimmed ? 'dimmed' : ''} ${collapsing ? 'collapsing' : ''}`}>
        <div className="item-main">
          {/* Large check circle */}
          <button
            ref={circleRef}
            className="check-circle"
            onClick={handleCheckClick}
            aria-label={item.checked ? 'Restore' : 'Done'}
          >
            <span className="check-ring" />
            {item.checked
              ? <span className="restore-symbol"><IconArrowBackUp size={16} /></span>
              : null
            }
          </button>

          {/* Name + qty inline */}
          <div className="item-info" onDoubleClick={() => !item.checked && setEditing(true)}>
            <span className="item-name">{item.name}</span>
            <span className="item-sep">·</span>
            <span className="item-qty">{qtyLabel}</span>
          </div>

          {/* 3-dot button */}
          <button
            className={`menu-dots ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="More options"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Inline flyout */}
        {menuOpen && (
          <div className="item-flyout">
            <div className="flyout-qty">
              <button className="qty-btn minus" onClick={() => changeQty(qty - 1)}><IconMinus size={16} /></button>
              <span className="qty-value">{qty}{item.unit ? '\u202f' + item.unit : ''}</span>
              <button className="qty-btn plus" onClick={() => changeQty(qty + 1)}><IconPlus size={16} /></button>
            </div>
            <div className="flyout-divider" />
            {!item.checked && (
              <button className="flyout-edit" onClick={() => { setMenuOpen(false); setEditing(true); }}>
                <IconPencil size={17} />
                Rename
              </button>
            )}
            <button className="flyout-delete" onClick={() => onDelete(item.id)}>
              <IconTrash size={17} />
              Delete
            </button>
          </div>
        )}
      </li>
    </>
  );
}
