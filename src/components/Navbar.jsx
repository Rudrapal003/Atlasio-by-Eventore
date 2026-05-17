import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Calendar, MessageSquare, User } from 'lucide-react';
import { useApp } from '../App';

const Navbar = () => {
  const { state } = useApp();
  const location = useLocation();
  const isCreator = state.userType === 'creator';

  if (!state.isLoggedIn) return null;

  // Hide the tab-bar on flow screens (wizard, signup, vendor detail, booking flow).
  // These have their own bottom CTAs and the tab-bar would cover them.
  const hideOnRoutes = ['/wizard', '/signup', '/confirm', '/success', '/vendor', '/chat', '/dispute', '/review', '/timeline', '/cart'];
  if (hideOnRoutes.some(r => location.pathname.startsWith(r))) return null;

  return (
    <div className="tabbar">
      <Link to={isCreator ? '/creator-dashboard' : '/discovery'} className={`tab-item ${location.pathname === (isCreator ? '/creator-dashboard' : '/discovery') ? 'active' : ''}`}>
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
        <span className="ind">3</span>
        <span className="tab-icon"><MessageSquare size={22} /></span>
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
