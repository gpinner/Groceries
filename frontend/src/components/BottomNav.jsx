import { useRef } from 'react';
import './BottomNav.css';

const LONG_PRESS_MS = 380;

export default function BottomNav({
  view,          // 'home' | 'list'
  onAddPress,    // home: create new list  |  list: open add-product sheet
  onGoHome,      // list view: navigate back to home
  onUserPress,
  onVoiceStart,
  onVoiceStop,
  isListening,
}) {
  const timerRef    = useRef(null);
  const didVoiceRef = useRef(false);

  // Long-press only active in list view (for voice)
  const handlePointerDown = (e) => {
    if (view !== 'list') return;
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
    if (view !== 'list') { onAddPress(); return; }
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

      {/* Left slot:
          - home view: invisible spacer (keeps center aligned)
          - list view: green "Lists" back button */}
      {view === 'list' ? (
        <button className="nav-tab nav-lists-active" onClick={onGoHome}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span className="nav-label">Lists</span>
        </button>
      ) : (
        <div className="nav-tab nav-placeholder" />
      )}

      {/* Center: green zone
          - home view: shows list icon (you are here), tap = new list
          - list view: shows + or mic icon, long-press = voice */}
      <button
        className={`nav-add ${isListening ? 'listening' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        aria-label={view === 'home' ? 'New list' : 'Add item (hold for voice)'}
      >
        {view === 'home' ? (
          /* List-lines icon — indicates "you are on the lists page" + creates new list */
          <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        ) : isListening ? (
          <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        ) : (
          <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        )}
      </button>

      {/* Right: Account */}
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
