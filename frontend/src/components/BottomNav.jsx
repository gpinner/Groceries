import './BottomNav.css';

export default function BottomNav({ activeTab, onTabChange, onAddPress, onListsPress }) {
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
        <button className="add-fab" onClick={onAddPress} aria-label="Add item">
          <span className="fab-icon">+</span>
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
