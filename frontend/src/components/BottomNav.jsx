import { useRef } from 'react';
import './BottomNav.css';

const LONG_PRESS_MS = 380;

export default function BottomNav({ onAddPress, onListsPress, onVoiceStart, onVoiceStop, isListening }) {
  const timerRef    = useRef(null);
  const didVoiceRef = useRef(false);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    didVoiceRef.current = false;

    timerRef.current = setTimeout(() => {
      timerRef.current    = null;
      didVoiceRef.current = true;
      onVoiceStart();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (!didVoiceRef.current) { onAddPress(); }
      return;
    }
    if (didVoiceRef.current || isListening) {
      onVoiceStop();
    }
  };

  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isListening) onVoiceStop();
  };

  return (
    <nav className="bottom-nav">
      <button className="nav-tab" onClick={onListsPress}>
        <span className="nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </span>
        <span className="nav-label">Lists</span>
      </button>

      <div className="nav-center">
        {isListening && <span className="pulse-ring" />}
        {isListening && <span className="pulse-ring pulse-ring-delay" />}
        <button
          className={`add-fab ${isListening ? 'listening' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          aria-label="Add item (hold for voice)"
        >
          <span className="fab-icon">{isListening ? '🎤' : '+'}</span>
        </button>
      </div>

      <button className="nav-tab" onClick={onListsPress}>
        <span className="nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </span>
        <span className="nav-label">Store</span>
      </button>
    </nav>
  );
}
