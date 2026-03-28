import './BottomNav.css';

const TABS = [
  { id: 'all',     label: 'List',    icon: '☰' },
  { id: 'checked', label: 'Done',    icon: '✓' },
];

export default function BottomNav({ activeTab, onTabChange, onAddPress }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-tab ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => onTabChange('all')}
      >
        <span className="nav-icon">{TABS[0].icon}</span>
        <span className="nav-label">{TABS[0].label}</span>
      </button>

      <div className="nav-center">
        <button className="add-fab" onClick={onAddPress} aria-label="Add item">
          <span className="fab-icon">+</span>
        </button>
      </div>

      <button
        className={`nav-tab ${activeTab === 'checked' ? 'active' : ''}`}
        onClick={() => onTabChange('checked')}
      >
        <span className="nav-icon">{TABS[1].icon}</span>
        <span className="nav-label">{TABS[1].label}</span>
      </button>
    </nav>
  );
}
