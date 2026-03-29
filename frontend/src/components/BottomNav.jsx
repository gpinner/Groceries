import { useRef } from 'react';
import './BottomNav.css';

const LONG_PRESS_MS = 380;

export default function BottomNav({
  view,        // 'home' | 'list'
  onAddPress,  // open add-product sheet (list view only)
  onGoHome,    // navigate back to home (list view only)
  onUserPress,
  onVoiceStart,
  onVoiceStop,
  isListening,
}) {
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
      if (!didVoiceRef.current) onAddPress();
      return;
    }
    if (didVoiceRef.current || isListening) onVoiceStop();
  };

  const handlePointerLeave = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (isListening) onVoiceStop();
  };

  return (
    <nav className="bottom-nav">

      {/* LEFT — Lists icon, always visible.
          Home view: grey/inactive (we're already here, tap does nothing).
          List view: green + tap navigates back to home. */}
      <button
        className={`nav-tab ${view === 'list' ? 'nav-lists-active' : ''}`}
        onClick={view === 'list' ? onGoHome : undefined}
        aria-label="My Lists"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6"  x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6"  x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span className="nav-label">Lists</span>
      </button>

      {/* CENTER — green + button, only when inside a list.
          Empty transparent zone on home view. */}
      {view === 'list' ? (
        <button
          className={`nav-add ${isListening ? 'listening' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          aria-label="Add item (hold for voice)"
        >
          {isListening ? (
            <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8"  y1="23" x2="16" y2="23"/>
            </svg>
          ) : (
            <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5"  x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
          )}
        </button>
      ) : (
        /* Spacer keeps Account pinned to the right */
        <div className="nav-center-empty" />
      )}

      {/* RIGHT — Account */}
      <button className="nav-tab" onClick={onUserPress}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <span className="nav-label">Account</span>
      </button>
    </nav>
  );
}
