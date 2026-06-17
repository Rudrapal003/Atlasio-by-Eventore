import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import App from '@/App';
import { LandingPage } from '@/components/LandingPage';
import { AuthModal } from '@/components/AuthModal';

export function Root() {
  // session is undefined initially to prevent flicker while checking auth state
  const [session, setSession] = useState<any>(undefined);
  const [guestMode, setGuestMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false); // auto close modal if they sign in successfully
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    // Show nothing while checking auth state to avoid flash of landing page
    return <div style={{ height: '100vh', background: 'var(--bg)' }} />;
  }

  if (session || guestMode) {
    return (
      <>
        <App isGuest={!session} onRequireAuth={() => setShowAuth(true)} />
        {showAuth && !session && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return <LandingPage onBypassLogin={() => setGuestMode(true)} />;
}
