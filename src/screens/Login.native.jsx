import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Loader2, AlertCircle, Fingerprint } from 'lucide-react';
import * as LocalAuthentication from 'expo-local-authentication';

const Login = () => {
  const { updateState } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(hasHardware && isEnrolled);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        // Fetch user type from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();

        updateState({ 
          isLoggedIn: true, 
          user: data.user, 
          userType: profile?.user_type || 'planner' 
        });
        
        navigate(profile?.user_type === 'creator' ? '/creator-dashboard' : '/my-events');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Evently',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // In a real app, you'd use a refresh token or secure storage
        // For this MVP, we'll assume the session is hydrated by Supabase
        // and this just validates the user is who they say they are.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
           const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          updateState({ 
            isLoggedIn: true, 
            user: session.user, 
            userType: profile?.user_type || 'planner' 
          });
          navigate(profile?.user_type === 'creator' ? '/creator-dashboard' : '/my-events');
        } else {
          setError('No saved session found. Please log in with password once.');
        }
      }
    } catch (err) {
      setError('Biometric authentication failed.');
    }
  };

  return (
    <div className="screen-body" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <ArrowLeft size={24} color="var(--ink)" />
        </button>
        <h2 style={{ margin: '0 0 0 16px', fontSize: '20px', fontWeight: 600 }}>Login</h2>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="john@example.com"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {biometricAvailable && (
          <button
            type="button"
            onClick={handleBiometricAuth}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: 'white',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Fingerprint size={20} color="var(--primary)" />
            Sign in with Biometrics
          </button>
        )}
      </form>

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingBottom: '20px' }}>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
