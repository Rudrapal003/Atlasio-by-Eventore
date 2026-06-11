import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Calendar, MessageSquare, User } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

const Navbar = () => {
  const { state } = useApp();
  const location = useLocation();
  const isCreator = state.userType === 'creator';
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count and subscribe to new messages
  useEffect(() => {
    if (!state.user?.id) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', state.user.id)
        .eq('read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Clear badge when user visits messages
    if (location.pathname === '/messages') {
      setUnreadCount(0);
    }

    // Realtime subscription
    const channel = supabase
      .channel('navbar-unread')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${state.user.id}`
      }, () => {
        setUnreadCount(n => n + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [state.user?.id, location.pathname]);

  if (!state.isLoggedIn) return null;

  // Hide the tab-bar on flow screens
  const hideOnRoutes = ['/wizard', '/signup', '/confirm', '/success', '/vendor', '/chat', '/dispute', '/review', '/timeline', '/cart'];
  if (hideOnRoutes.some(r => location.pathname.startsWith(r))) return null;

  return (
    <div className="tabbar">
      <Link
        to={isCreator ? '/creator-dashboard' : '/discovery'}
        className={`tab-item ${location.pathname === (isCreator ? '/creator-dashboard' : '/discovery') ? 'active' : ''}`}
      >
        <span className="tab-icon"><Search size={22} /></span>
        {isCreator ? 'Dashboard' : 'Discover'}
      </Link>

      {!isCreator && (
        <Link to="/my-events" className={`tab-item ${location.pathname === '/my-events' ? 'active' : ''}`}>
          <span className="tab-icon"><Calendar size={22} /></span>
          My Events
        </Link>
      )}

      <Link to="/messages" className={`tab-item ${location.pathname === '/messages' ? 'active' : ''}`}>
        <span className="tab-icon" style={{ position: 'relative' }}>
          <MessageSquare size={22} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4, right: -6,
              minWidth: 16, height: 16,
              background: '#EF4444',
              color: 'white',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        Messages
      </Link>

      <Link to="/profile" className={`tab-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <span className="tab-icon"><User size={22} /></span>
        Profile
      </Link>
    </div>
  );
};

export default Navbar;
