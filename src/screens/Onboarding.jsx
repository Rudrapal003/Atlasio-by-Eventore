import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { User, Briefcase } from 'lucide-react';

const Onboarding = () => {
  const { updateState } = useApp();
  const navigate = useNavigate();

  const selectUserType = (type) => {
    updateState({ userType: type });
    navigate('/signup');
  };

  return (
    <div className="screen-body" style={{ padding: '40px 24px', justifyContent: 'center' }}>
      <div className="onboarding-content" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '42px', color: 'var(--brand)', marginBottom: '8px' }}>Evently</h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '48px' }}>One stop. Every event.</p>
        
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>How will you use Evently?</h2>
        
        <div 
          className="choice-card" 
          onClick={() => selectUserType('planner')}
          style={{
            padding: '24px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'white',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>I'm a Planner</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Planning a wedding or event</p>
          </div>
        </div>

        <div 
          className="choice-card" 
          onClick={() => selectUserType('creator')}
          style={{
            padding: '24px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'white'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>I'm a Creator</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Caterer, Photographer, Venue, etc.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
