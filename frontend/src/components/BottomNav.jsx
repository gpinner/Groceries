import { useRef } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput.js';
import './BottomNav.css';

const LONG_PRESS_MS = 380;

export default function BottomNav({ activeTab, onTabChange, onAddPress, onListsPress, onVoiceResult }) {
  const { listening, interim, supported, start, stop } = useVoiceInput();
  const timerRef    = useRef(null);
  const didVoiceRef = useRef(false);

  const handlePointerDown = (e) => {
    e.preventDefault();
    didVoiceRef.current = false;

    timerRef.current = setTimeout(() => {
      timerRef.current    = null;
      didVoiceRef.current = true;
      start();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      // Released before long-press threshold → regular tap
      clearTimeout(timerRef.current);
      timerRef.current = null;
      onAddPress();
      return;
    }
    if (didVoiceRef.current) {
      const transcript = stop();
      if (transcript) onVoiceResult(transcript);
    }
  };

  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (listening) {
      const transcript = stop();
      if (transcript) onVoiceResult(transcript);
    }
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
        {/* Interim transcript bubble */}
        {listening && (
          <div className="voice-bubble">
            <span className="voice-bubble-text">
              {interim || '🎤 Listening…'}
            </span>
          </div>
        )}

        {/* Pulse rings while listening */}
        {listening && <span className="pulse-ring" />}
        {listening && <span className="pulse-ring pulse-ring-delay" />}

        <button
          className={`add-fab ${listening ? 'listening' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          aria-label={supported ? 'Add item (hold for voice)' : 'Add item'}
        >
          <span className="fab-icon">{listening ? '🎤' : '+'}</span>
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
