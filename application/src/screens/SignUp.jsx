import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Check, Star, Loader2, CreditCard, AlertCircle, ScrollText } from 'lucide-react';

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
  const agreementRef = useRef(null);
  const [agreementScrolled, setAgreementScrolled] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Creator flow: basics → type → Stripe → social → agreement → preview
  // Planner flow: basics → agreement
  const totalSteps = isCreator ? 6 : 2;

  const handleNext = async () => {
    setError(null);

    // QA Bypass for testing without hitting rate limits
    if (localStorage.getItem('QA_MODE') === 'true' && step === totalSteps) {
      updateState({ 
        isLoggedIn: true, 
        userType: isCreator ? 'creator' : 'planner', 
        user: { 
          email: formData.email, 
          id: 'qa-test-id',
          user_metadata: { userType: isCreator ? 'creator' : 'planner', full_name: formData.name }
        } 
      });
      navigate(isCreator ? '/creator-dashboard' : '/my-events');
      return;
    }

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

    if (isCreator && step === 5 && !agreementAccepted) {
      setError('You must read and accept the Vendor Agreement to continue.');
      return;
    }
    if (!isCreator && step === 2 && !agreementAccepted) {
      setError('You must read and accept the Planner Agreement to continue.');
      return;
    }

    if (step < totalSteps) {
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
              userType: state.userType,   // KEY FIX: must match App.web.jsx hydration key
              user_type: state.userType,  // keep legacy key too
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Profile is automatically created by Supabase trigger `on_auth_user_created`


          // 3. If creator, create vendor entry
          if (isCreator) {
            const { error: vendorError } = await supabase
              .from('vendors')
              .insert([{
                id: authData.user.id,
                user_id: authData.user.id,
                business_name: formData.name,
                category: formData.creatorType || 'Other',
                is_approved: false,
                agreement_signed: agreementAccepted,
                agreement_signed_at: agreementAccepted ? new Date().toISOString() : null
              }]);
            if (vendorError) console.warn('Vendor insert:', vendorError.message);

            // Log agreement acceptance
            if (agreementAccepted) {
              await supabase.from('agreements').insert([{
                user_id: authData.user.id,
                type: 'vendor',
                version: '1.0',
                signed_at: new Date().toISOString()
              }]);
            }
          } else {
            // Log planner agreement acceptance
            await supabase.from('agreements').insert([{
              user_id: authData.user.id,
              type: 'planner',
              version: '1.0',
              signed_at: new Date().toISOString()
            }]).catch(() => {}); // non-blocking
          }

          updateState({ isLoggedIn: true, user: authData.user, userType: state.userType });
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
          {isCreator ? `Step ${step} of ${totalSteps}` : 'Planner Sign Up'}
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

      {step === 2 && isCreator && (
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
                background: formData.creatorType === type ? 'var(--primary-soft)' : 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
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
          <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontFamily: 'var(--serif)' }}>Get paid through Eventore</h3>
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
              background: formData.stripeStatus === 'connected' ? 'var(--primary-soft)' : 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)'
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
            style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: formData.connected.google ? 'var(--primary-soft)' : 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}
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
            style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: formData.connected.instagram ? 'var(--primary-soft)' : 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}
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

      {step === 5 && isCreator && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ScrollText size={22} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--serif)' }}>Vendor Agreement</h3>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Please read and accept the Eventore Vendor Agreement before going live.</p>

          <div
            style={{
              height: 260, overflowY: 'auto', padding: '16px',
              background: 'var(--glass-bg)', borderRadius: 12,
              border: '1px solid var(--line)', fontSize: 12,
              lineHeight: 1.7, color: 'var(--ink)'
            }}
          >
            <strong>Eventore Vendor Agreement — Version 1.0</strong><br /><br />
            <strong>1. Platform Role.</strong> Eventore is a marketplace platform and is not an employer or agent of the Vendor. Eventore facilitates connections between Vendors and Event Planners.<br /><br />
            <strong>2. Commission.</strong> Eventore charges an 8% platform fee on all confirmed bookings. This fee is deducted automatically from planner payments before payout to the Vendor.<br /><br />
            <strong>3. Payout Timeline.</strong> Funds are released to the Vendor 48 hours after the confirmed event date, subject to no active disputes.<br /><br />
            <strong>4. Listing Accuracy.</strong> Vendors must maintain accurate pricing, portfolio images, and availability. Misleading listings are grounds for account suspension.<br /><br />
            <strong>5. Contact Policy.</strong> Vendors may not share direct contact information (phone, email, social handles) with planners until a booking is confirmed through the platform.<br /><br />
            <strong>6. Dispute Resolution.</strong> Vendors agree to participate in Eventore's Resolution Centre process before pursuing any external legal action.<br /><br />
            <strong>7. Termination.</strong> Eventore reserves the right to remove any vendor for violations of these terms, with or without prior notice.<br /><br />
            <strong>8. Governing Law.</strong> This agreement is governed by the laws of the Province of British Columbia, Canada.<br /><br />
          </div>

          <label
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
              background: agreementAccepted ? 'var(--primary-soft)' : 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              border: `1px solid ${agreementAccepted ? 'var(--primary)' : 'var(--line)'}`
            }}
          >
            <input 
              type="checkbox" 
              checked={agreementAccepted} 
              onChange={(e) => setAgreementAccepted(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
              I have read and agree to the Eventore Vendor Agreement (v1.0)
            </span>
          </label>
        </div>
      )}

      {step === 2 && !isCreator && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ScrollText size={22} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--serif)' }}>Planner Terms & Conditions</h3>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Please read and accept the terms of service to start planning your event.</p>

          <div
            style={{
              height: 260, overflowY: 'auto', padding: '16px',
              background: 'var(--glass-bg)', borderRadius: 12,
              border: '1px solid var(--line)', fontSize: 12,
              lineHeight: 1.7, color: 'var(--ink)'
            }}
          >
            <strong>Eventore Planner Agreement — Version 1.0</strong><br /><br />
            <strong>1. Platform Role.</strong> Eventore facilitates connections between event planners ("Users") and event vendors ("Vendors"). We do not guarantee vendor performance or conduct.<br /><br />
            <strong>2. Escrow Payments.</strong> Payments made for bookings are held in secure escrow by Eventore. Funds are not released to the Vendor until 48 hours after the confirmed date of your event, protecting your investment.<br /><br />
            <strong>3. Cancellations & Refunds.</strong> Cancellations made more than 30 days prior to the event are eligible for a full refund minus a 3% payment processing fee. Later cancellations are subject to the specific Vendor's strict cancellation policy.<br /><br />
            <strong>4. Dispute Resolution.</strong> Users must file any disputes regarding vendor performance through the Eventore Resolution Centre within 7 days following the event. Eventore will act as an impartial mediator.<br /><br />
            <strong>5. Privacy & Communication.</strong> Your personal contact information is kept entirely private and is never shared with a Vendor until a booking is officially confirmed and paid. Circumventing the platform to book offline violates these terms.<br /><br />
            <strong>6. Age Requirement.</strong> You must be 18 years of age or older to use the Eventore platform.<br /><br />
          </div>

          <label
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
              background: agreementAccepted ? 'var(--primary-soft)' : 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              border: `1px solid ${agreementAccepted ? 'var(--primary)' : 'var(--line)'}`
            }}
          >
            <input 
              type="checkbox" 
              checked={agreementAccepted} 
              onChange={(e) => setAgreementAccepted(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
              I have read and agree to the Eventore Planner Agreement (v1.0)
            </span>
          </label>
        </div>
      )}

      {step === 6 && isCreator && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontFamily: 'var(--serif)' }}>Profile Preview</h3>
          <div style={{ background: 'var(--surface-card)', backdropFilter: 'var(--glass-blur)', borderRadius: '20px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', position: 'relative' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'transparent', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Check size={32} color="var(--primary)" />
               </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '18px' }}>{formData.name || 'Your Business Name'}</h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted)' }}>{formData.creatorType} · Vancouver, BC</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {formData.connected.google && <span className="badge badge-available">4.8 ★ Google</span>}
                {formData.connected.instagram && <span className="badge badge-pro">24 IG Photos</span>}
                {formData.stripeConnected && <span className="badge badge-available">Stripe ready</span>}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>Your profile is ready for planners to see!</p>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
        <button
          onClick={handleNext}
          disabled={!!loading || (isCreator && step === 3 && formData.stripeStatus === 'verifying')}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px',
            background: 'var(--primary)', color: 'white', border: 'none',
            fontSize: '16px', fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            opacity: loading ? 0.7 : 1, cursor: 'pointer'
          }}
        >
          {isCreator && step === totalSteps ? 'Launch Dashboard' : 'Continue'}
        </button>
          {isCreator && step === 5 && (
            <p onClick={handleNext} style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>Skip for now</p>
          )}
      </div>
    </div>
  );
};

export default SignUp;
