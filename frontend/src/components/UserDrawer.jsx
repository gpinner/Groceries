import './UserDrawer.css';

export default function UserDrawer({ user, onClose }) {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="user-drawer">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-avatar">{initials}</div>
          <div className="drawer-user-info">
            <span className="drawer-user-name">{user.name}</span>
            <span className="drawer-user-email">{user.email}</span>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Sections */}
        <div className="drawer-section">
          <p className="drawer-section-title">Account</p>
          <DrawerRow icon="👤" label="Edit profile" />
          <DrawerRow icon="🔔" label="Notifications" />
          <DrawerRow icon="🔒" label="Privacy" />
        </div>

        <div className="drawer-section">
          <p className="drawer-section-title">Preferences</p>
          <DrawerRow icon="🌍" label="Language" value="English" />
          <DrawerRow icon="🎨" label="Theme" value="Light" />
          <DrawerRow icon="🛒" label="Default store" value="None" />
        </div>

        <div className="drawer-section">
          <p className="drawer-section-title">About</p>
          <DrawerRow icon="📋" label="Version" value="1.0.0" />
          <DrawerRow icon="❓" label="Help & Feedback" />
        </div>

        <button className="drawer-signout">Sign out</button>
      </div>
    </>
  );
}

function DrawerRow({ icon, label, value }) {
  return (
    <button className="drawer-row">
      <span className="drawer-row-icon">{icon}</span>
      <span className="drawer-row-label">{label}</span>
      {value && <span className="drawer-row-value">{value}</span>}
      <svg className="drawer-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
