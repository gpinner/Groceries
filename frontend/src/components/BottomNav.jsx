import { useRef } from 'react';
import './BottomNav.css';

const LONG_PRESS_MS = 380;

export default function BottomNav({ activeTab, onTabChange, onAddPress, onListsPress, onVoiceStart, onVoiceStop, isListening }) {
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
      <button
        className={`nav-tab ${activeTab === 'lists' ? 'active' : ''}`}
        onClick={onListsPress}
      >
        <span className="nav-icon">☰</span>
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

      <button
        className={`nav-tab ${activeTab === 'done' ? 'active' : ''}`}
        onClick={() => onTabChange('done')}
      >
        <span className="nav-icon">✓</span>
        <span className="nav-label">Done</span>
      </button>
    </nav>
  );
}
