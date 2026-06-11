import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { updateState } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : '+1' + phone.replace(/\D/g, ''),
      });
      if (otpError) throw otpError;
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : '+1' + phone.replace(/\D/g, '');
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      if (verifyError) throw verifyError;
      
      if (data?.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .single();

        updateState({ 
          isLoggedIn: true, 
          user: data.session.user, 
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

  return (
    <div className="screen-body" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => step === 'otp' ? setStep('phone') : navigate('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
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

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Phone Number</label>
            <input 
              type="tel" 
              placeholder="(555) 000-0000"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(null); }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--rose)',
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
            {loading ? 'Sending Code...' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Verification Code</label>
            <input 
              type="text" 
              placeholder="000000"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(null); }}
            />
            <p style={{fontSize: '12px', color: 'var(--muted)', marginTop: '8px'}}>Sent to {phone}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--rose)',
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
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingBottom: '20px', paddingTop: '40px' }}>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
