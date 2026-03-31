import { useState } from 'react';
import { PATTERNS } from '../data/listPatterns.jsx';
import './ListCard.css';

export default function ListCard({ list, stats, patternId = 0, onOpen, onRename, onDelete, onChangePattern }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { Component: PatternComp } = PATTERNS[patternId % PATTERNS.length];

  return (
    <div className="lc-card" onClick={() => { if (!menuOpen) onOpen(); }}>
      <div className="lc-pattern"><PatternComp /></div>
      <div className="lc-overlay" />

      {/* 3-dot button top right */}
      <button className="lc-dots" onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}>
        <span /><span /><span />
      </button>

      {menuOpen && (
        <div className="lc-menu" onClick={e => e.stopPropagation()}>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onRename(); }}>Rename</button>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onChangePattern(); }}>Change picture</button>
          <button className="lc-menu-delete" onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}>Delete</button>
        </div>
      )}

      <div className="lc-footer">
        <span className="lc-name">{list.name}</span>
        <div className="lc-badges">
          <span className="lc-badge lc-badge-shop">{stats ? stats.shopping : '—'}</span>
          <span className="lc-badge lc-badge-done">{stats ? stats.done : '—'}</span>
        </div>
      </div>
    </div>
  );
}
