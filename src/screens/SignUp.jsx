import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Check, Star, Loader2, CreditCard, AlertCircle } from 'lucide-react';

// Inline SVG for Instagram — the installed lucide-react version doesn't export brand icons.
const Instagram = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const SignUp = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    creatorType: '',
    stripeConnected: false,
    stripeStatus: 'pending', // 'pending' | 'verifying' | 'connected'
    connected: {
      google: false,
      instagram: false,
      facebook: false
    }
  });

  const isCreator = state.userType === 'creator';
  const themeClass = isCreator ? 'theme-creator' : 'theme-planner';

  // Creator flow is 5 steps: basics → type → Stripe Connect → social sync → preview.
  const totalCreatorSteps = isCreator ? 5 : 1;

  const handleNext = async () => {
    setError(null);

    // If it's the first step, we validate and prepare for auth
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name) {
        setError('Please fill in all fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    if (isCreator && step < totalCreatorSteps) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              user_type: state.userType,
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Create profile entry
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                full_name: formData.name,
                user_type: state.userType,
                phone_number: '', // Can be updated later
              }
            ]);

          if (profileError) throw profileError;

          // 3. If creator, create vendor entry
          if (isCreator) {
            const { error: vendorError } = await supabase
              .from('vendors')
              .insert([
                {
                  id: authData.user.id,
                  business_name: formData.name, // Use name as default business name
                  category: formData.creatorType || 'Other',
                  verified: false
                }
              ]);
            if (vendorError) throw vendorError;
          }

          updateState({ isLoggedIn: true, user: authData.user });
          navigate(isCreator ? '/creator-dashboard' : '/wizard');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const simulateStripe = () => {
    setFormData(d => ({ ...d, stripeStatus: 'verifying' }));
    setTimeout(() => {
      setFormData(d => ({ ...d, stripeStatus: 'connected', stripeConnected: true }));
    }, 1600);
  };

  const simulateConnect = (platform) => {
    setLoading(platform);
    setTimeout(() => {
      setFormData({
        ...formData,
        connected: { ...formData.connected, [platform]: true }
      });
      setLoading(false);
    }, 1500);
  };

  const creatorTypes = ['Caterer', 'Photographer', 'Anchor', 'Decor', 'Valet', 'Venue'];

  return (
    <div className={`screen-body ${themeClass}`} style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <ArrowLeft size={24} color="var(--ink)" />
        </button>
        <h2 style={{ margin: '0 0 0 16px', fontSize: '20px', fontWeight: 600 }}>
          {isCreator ? `Step ${step} of ${totalCreatorSteps}` : 'Planner Sign Up'}
        </h2>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="john@example.com"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '15px' }}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontFamily: 'var(--serif)' }}>What do you do?</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>Select your primary service category.</p>
          {creatorTypes.map(type => (
            <div 
              key={type}
              onClick={() => setFormData({...formData, creatorType: type})}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: formData.creatorType === type ? 'var(--primary)' : 'var(--line)',
                background: formData.creatorType === type ? 'var(--primary-soft)' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 500, color: formData.creatorType === type ? 'var(--primary)' : 'var(--ink)' }}>{type}</span>
              {formData.creatorType === type && <Check size={18} color="var(--primary)" />}
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontFamily: 'var(--serif)' }}>Get paid through Evently</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>
            Connect a payout account so deposits land in your bank automatically. Stripe handles KYC and tax forms.
          </p>

          <div
            onClick={() => formData.stripeStatus === 'pending' && simulateStripe()}
            style={{
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: formData.stripeStatus === 'connected' ? 'default' : 'pointer',
              background: formData.stripeStatus === 'connected' ? 'var(--primary-soft)' : 'white'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <CreditCard size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '15px' }}>Stripe Connect</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                {formData.stripeStatus === 'pending'   && 'Tap to connect — under 2 minutes'}
                {formData.stripeStatus === 'verifying' && 'Verifying your business…'}
                {formData.stripeStatus === 'connected' && 'Connected — payouts ready'}
              </p>
            </div>
            {formData.stripeStatus === 'verifying' && <Loader2 className="animate-spin" size={18} />}
            {formData.stripeStatus === 'connected' && <Check size={18} color="var(--primary)" />}
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontFamily: 'var(--serif)' }}>Fast Portfolio Setup</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>Sync your existing content to build your profile in seconds.</p>
          
          <div 
            onClick={() => !formData.connected.google && simulateConnect('google')}
            style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: formData.connected.google ? 'var(--primary-soft)' : 'white' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA4335' }}>
              <Star size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '15px' }}>Google Reviews</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{formData.connected.google ? '4.8 ★ (127 reviews) synced' : 'Import your reputation'}</p>
            </div>
            {loading === 'google' ? <Loader2 className="animate-spin" size={18} /> : (formData.connected.google ? <Check size={18} color="var(--primary)" /> : <Check size={18} style={{opacity: 0}} />)}
          </div>

          <div 
            onClick={() => !formData.connected.instagram && simulateConnect('instagram')}
            style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: formData.connected.instagram ? 'var(--primary-soft)' : 'white' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E1306C' }}>
              <Instagram size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '15px' }}>Instagram Photos</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{formData.connected.instagram ? '24 latest posts synced' : 'Import your gallery'}</p>
            </div>
            {loading === 'instagram' ? <Loader2 className="animate-spin" size={18} /> : (formData.connected.instagram ? <Check size={18} color="var(--primary)" /> : <Check size={18} style={{opacity: 0}} />)}
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontFamily: 'var(--serif)' }}>Profile Preview</h3>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ height: '120px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '64px', he