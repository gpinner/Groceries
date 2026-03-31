import {
  IconX, IconUser, IconBell, IconLock, IconWorld, IconPalette,
  IconShoppingCart, IconInfoCircle, IconHelpCircle, IconChevronRight,
} from '@tabler/icons-react';
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
          <button className="drawer-close" onClick={onClose}><IconX size={18} /></button>
        </div>

        {/* Sections */}
        <div className="drawer-section">
          <p className="drawer-section-title">Account</p>
          <DrawerRow icon={<IconUser size={18} />} label="Edit profile" />
          <DrawerRow icon={<IconBell size={18} />} label="Notifications" />
          <DrawerRow icon={<IconLock size={18} />} label="Privacy" />
        </div>

        <div className="drawer-section">
          <p className="drawer-section-title">Preferences</p>
          <DrawerRow icon={<IconWorld size={18} />} label="Language" value="English" />
          <DrawerRow icon={<IconPalette size={18} />} label="Theme" value="Light" />
          <DrawerRow icon={<IconShoppingCart size={18} />} label="Default store" value="None" />
        </div>

        <div className="drawer-section">
          <p className="drawer-section-title">About</p>
          <DrawerRow icon={<IconInfoCircle size={18} />} label="Version" value="1.0.0" />
          <DrawerRow icon={<IconHelpCircle size={18} />} label="Help & Feedback" />
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
      <IconChevronRight size={18} strokeWidth={2.5} className="drawer-row-chevron" />
    </button>
  );
}
