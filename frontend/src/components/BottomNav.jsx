import { useRef } from 'react';
import { IconLayoutList, IconPlus, IconMicrophone, IconUser } from '@tabler/icons-react';
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
        <IconLayoutList size={22} strokeWidth={1.8} />
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
            <IconMicrophone size={22} strokeWidth={1.8} />
          ) : (
            <IconPlus size={26} strokeWidth={2.5} />
          )}
        </button>
      ) : (
        /* Spacer keeps Account pinned to the right */
        <div className="nav-center-empty" />
      )}

      {/* RIGHT — Account */}
      <button className="nav-tab" onClick={onUserPress}>
        <IconUser size={22} strokeWidth={1.8} />
        <span className="nav-label">Account</span>
      </button>
    </nav>
  );
}
