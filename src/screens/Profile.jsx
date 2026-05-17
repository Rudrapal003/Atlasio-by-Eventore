import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Bell, LogOut, ChevronRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../App';

const Profile = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const themeClass = state.userType === 'creator' ? 'theme-creator' : 'theme-planner';
  const [openSection, setOpenSection] = useState(null);

  const handleLogout = () => {
    updateState({ isLoggedIn: false, userType: null });
    navigate('/');
  };

  const menuItems = [
    { id: 'personal',      icon: <User size={20} />,     label: 'Personal Information', body: 'Name, email, phone number, language preference, and profile photo are managed here. Phone changes require SMS verification.' },
    { id: 'notifications', icon: <Bell size={20} />,     label: 'Notifications',         body: 'Choose what triggers a push notification — new messages, booking updates, day-of reminders, and Evently announcements. Quiet hours are honored.' },
    { id: 'privacy',       icon: <Shield size={20} />,   label: 'Privacy & Security',    body: 'Manage two-factor authentication, blocked contacts, data export, and account deletion. Per PIPEDA, full data export delivers within 30 days.' },
    { id: 'app',           icon: <Settings size={20} />, label: 'App Settings',          body: 'Theme, currency, distance units (mi/km), and accessibility preferences including larger text and high-contrast mode.' }
  ];

  if (openSection) {
    const section = menuItems.find(m => m.id === openSection);
    return (
      <div className={`screen-body ${themeClass}`}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setOpenSection(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={20} />
          </button>
          <h6 style={{ margin: 0, fontSize: 16 }}>{section.label}</h6>
        </div>
        <div style={{ padding: 20, color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          {section.body}
          <p style={{ marginTop: 24, fontSize: 12, color: 'var(--faint)' }}>
            (Placeholder — full controls land in Phase 2 of the roadmap.)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`screen-body ${themeClass}`}>
      <div style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--primary-soft)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'white', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', border: '2px solid var(--primary)' }}>
          <User size={40} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>{state.user?.name || 'Priya Patel'}</h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>{state.userType === 'creator' ? 'Premium Vendor' : 'Event Planner'}</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', overflow: 'hidden' }}>
          {menuItems.map((item, idx) => (
            <div key={item.id}
              onClick={() => setOpenSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderBottom: idx === menuItems.length - 1 ? 'none' : '1px solid var(--line)',
                cursor: 'pointer'
              }}
            >
              <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: 500 }}>{item.label}</span>
              <ChevronRight size={18} color="var(--faint)" />
            </div>
          ))}
        </div>

        <button onClick={handleLogout} style={{
          marginTop: '32px', width: '100%', padding: '16px', borderRadius: 'var(--radius-md)',
          border: '1px solid #FEE2E2', background: '#FFF5F5', color: '#EF4444',
          fontSize: '15px', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          cursor: 'pointer'
        }}>
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
