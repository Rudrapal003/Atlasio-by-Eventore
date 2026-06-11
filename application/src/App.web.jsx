import React, { createContext, useContext, useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Onboarding from './screens/Onboarding';
import SignUp from './screens/SignUp';
import Login from './screens/Login.web';
import EventBudgetStep from './screens/EventBudgetStep';
import EventWizard from './screens/EventWizard';
import VendorDiscovery from './screens/VendorDiscovery';
import VendorProfile from './screens/VendorProfile';
import BookingConfirm from './screens/BookingConfirm';
import Success from './screens/Success';
import MyEvents from './screens/MyEvents';
import Messages from './screens/Messages';
import Profile from './screens/Profile';
import CreatorDashboard from './screens/CreatorDashboard';
import Inquiries from './screens/Inquiries';
import PortfolioManager from './screens/PortfolioManager';
import ChatView from './screens/ChatView';
import DisputeFlow from './screens/DisputeFlow';
import ReviewPrompt from './screens/ReviewPrompt';
import DayOfTimeline from './screens/DayOfTimeline';
import MultiVendorCheckout from './screens/MultiVendorCheckout';
import EventDashboard from './screens/EventDashboard';
import AdminDashboard from './screens/AdminDashboard';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import { AppContext, useApp } from './AppContext';

function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('eventore_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch(e) {}
    
    return {
      userType: null,
      isLoggedIn: false,
      user: null,
      event: {
        type: null,
        title: '',
        date: null,
        guests: null,
        budget: null,
        location: '',
        culturalTags: []
      },
      budget: null,
      guests: null,
      selectedVendor: null,
      selectedPackage: null,
      inquiries: [],
      bookings: []
    };
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userType = session.user?.user_metadata?.userType || null;
        updateState({ isLoggedIn: true, user: session.user, userType });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('QA_MODE') === 'true') return; // Ignore Supabase logout in QA
      if (session) {
        const userType = session.user?.user_metadata?.userType || null;
        updateState({ isLoggedIn: true, user: session.user, userType });
      } else {
        updateState({ isLoggedIn: false, user: null, userType: null });
      }
    });

    // State is already initialized synchronously above.

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('eventore_state', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist Eventore state:', e);
    }
  }, [state]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const themeClass = state.userType === 'creator' ? 'theme-creator' : 'theme-planner';

  return (
    <AppContext.Provider value={{ state, updateState }}>
      <Router>
        <div className="phone-wrapper">
          <div className={`phone ${themeClass}`}>
            <div className="screen">
              <div className="status-bar">
                <span>9:41</span>
                <div className="right">
                  <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.7" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="0.7" fill="currentColor"/><rect x="9" y="3" width="3" height="8" rx="0.7" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="0.7" fill="currentColor"/></svg>
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M7.5 2.2c2.4 0 4.6 .9 6.2 2.4l-1 1.1A7.4 7.4 0 0 0 7.5 3.7 7.4 7.4 0 0 0 2.3 5.7L1.3 4.6A8.8 8.8 0 0 1 7.5 2.2Zm0 3a5.4 5.4 0 0 1 3.7 1.5l-1 1.1a4 4 0 0 0-5.4 0L3.8 6.7A5.4 5.4 0 0 1 7.5 5.2Zm0 3a2 2 0 0 1 1.5 .7l-1.5 1.6L6 8.9a2 2 0 0 1 1.5-.7Z" fill="currentColor"/></svg>
                  <svg width="27" height="12" viewBox="0 0 27 12"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="currentColor" strokeOpacity=".5"/><rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/><rect x="23.5" y="3" width="2" height="6" rx="1" fill="currentColor" fillOpacity=".5"/></svg>
                </div>
              </div>
              <ErrorBoundary>
              <Routes>
                <Route path="/" element={state.isLoggedIn ? <Navigate to={state.userType === 'creator' ? '/creator-dashboard' : '/my-events'} replace /> : <Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/wizard" element={<EventWizard />} />
                <Route path="/budget" element={<EventBudgetStep />} />
                <Route path="/discovery" element={<VendorDiscovery />} />
                <Route path="/vendor/:id" element={<VendorProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-events" element={<MyEvents />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/confirm" element={<BookingConfirm />} />
                <Route path="/success" element={<Success />} />
                <Route path="/creator-dashboard" element={<CreatorDashboard />} />
                <Route path="/inquiries" element={<Inquiries />} />
                <Route path="/portfolio" element={<PortfolioManager />} />
                <Route path="/chat/:id" element={<ChatView />} />
                <Route path="/dispute" element={<DisputeFlow />} />
                <Route path="/review" element={<ReviewPrompt />} />
                <Route path="/timeline" element={<DayOfTimeline />} />
                <Route path="/cart" element={<MultiVendorCheckout />} />
                <Route path="/event/:id" element={<EventDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </ErrorBoundary>
              <Navbar />
              <div className="home-bar"></div>
            </div>
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
