import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Bell, LogOut, ChevronRight, ArrowLeft, Camera } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

const Profile = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const themeClass = state.userType === 'creator' ? 'theme-creator' : 'theme-planner';
  const [openSection, setOpenSection] = useState(null);

  // Read name/email from correct Supabase auth paths
  const authUser = state.user;
  const displayName = authUser?.user_metadata?.full_name
    || authUser?.user_metadata?.name
    || state.user?.name
    || '';
  const displayEmail = authUser?.email || '';
  const avatarUrl = authUser?.user_metadata?.avatar_url || null;

  const [editName, setEditName] = useState(displayName);
  const [editEmail, setEditEmail] = useState(displayEmail);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sync edit fields if user changes
  useEffect(() => {
    setEditName(displayName);
    setEditEmail(displayEmail);
  }, [state.user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    updateState({ isLoggedIn: false, userType: null, user: null });
    navigate('/');
  };

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: editEmail !== displayEmail ? editEmail : undefined,
        data: { full_name: editName }
      });
      if (!error) {
        // Also update our local state so it shows immediately
        updateState({
          user: {
            ...state.user,
            email: editEmail,
            user_metadata: { ...state.user?.user_metadata, full_name: editName }
          }
        });
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
      setOpenSection(null);
    }
  };

  const menuItems = [
    { id: 'personal',      icon: <User size={20} />,     label: 'Personal Information' },
    { id: 'notifications', icon: <Bell size={20} />,     label: 'Notifications' },
    { id: 'privacy',       icon: <Shield size={20} />,   label: 'Privacy & Security',  body: 'Manage two-factor authentication, blocked contacts, data export, and account deletion. Per PIPEDA, full data export delivers within 30 days.' },
    { id: 'app',           icon: <Settings size={20} />, label: 'App Settings',         body: 'Theme, currency, distance units (mi/km), and accessibility preferences including larger text and high-contrast mode.' }
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
        <div style={{ padding: 20 }}>
          {section.id === 'personal' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Full Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 16, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Email Address</label>
                <input
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 16, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Account Type</label>
                <div style={{ padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 15, background: '#F9F9F9', color: 'var(--muted)' }}>
                  {state.userType === 'creator' ? 'Premium Vendor' : 'Event Planner'}
                </div>
              </div>
              <button
                onClick={handleSavePersonal}
                disabled={saving}
                className="btn btn-primary"
                style={{ marginTop: 8, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : section.id === 'notifications' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Push Notifications', value: pushNotifs, setter: setPushNotifs },
                { label: 'Email Updates', value: emailUpdates, setter: setEmailUpdates }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
                  <div
                    onClick={() => item.setter(v => !v)}
                    style={{
                      width: 44, height: 26, borderRadius: 13, cursor: 'pointer',
                      background: item.value ? 'var(--primary)' : '#D1D5DB',
                      position: 'relative', transition: 'background 0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      left: item.value ? 21 : 3, transition: 'left 0.2s'
                    }} />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
                Quiet hours are honored — you won't receive notifications between 10 PM and 8 AM.
              </p>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              {section.body}
              <p style={{ marginTop: 24, fontSize: 12, color: 'var(--faint)' }}>
                (Additional controls available in the final production release.)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`screen-body ${themeClass}`}>
      <div style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--primary-soft)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ position: 'relative', width: '88px', margin: '0 auto 16px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)', border: '2px solid var(--primary)',
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden'
          }}>
            {!avatarUrl && <User size={40} color="var(--primary)" />}
          </div>
          <div
            onClick={() => setOpenSection('personal')}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <Camera size={13} color="white" />
          </div>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>
          {displayName || displayEmail || 'My Profile'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          {displayEmail}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--primary)', margin: '4px 0 0', fontWeight: 600 }}>
          {state.userType === 'creator' ? 'Premium Vendor' : 'Event Planner'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', overflow: 'hidden' }}>
          {menuItems.map((item, idx) => (
            <div key={item.id}
              onClick={() => setOpenSection(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
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
