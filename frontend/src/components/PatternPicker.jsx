import { PATTERNS } from '../data/listPatterns.jsx';
import './PatternPicker.css';

export default function PatternPicker({ currentId, onSelect, onClose }) {
  return (
    <div className="pp-backdrop" onClick={onClose}>
      <div className="pp-sheet" onClick={e => e.stopPropagation()}>
        <div className="pp-handle" />
        <p className="pp-title">Choose a style</p>
        <div className="pp-grid">
          {PATTERNS.map(({ id, label, Component }) => (
            <button
              key={id}
              className={`pp-option${currentId === id ? ' pp-selected' : ''}`}
              onClick={() => { onSelect(id); onClose(); }}
            >
              <div className="pp-thumb"><Component /></div>
              <span className="pp-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
