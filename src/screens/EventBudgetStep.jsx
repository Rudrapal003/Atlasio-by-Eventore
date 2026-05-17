import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

const EventBudgetStep = () => {
  const { state, updateState } = useApp();

  const handleBudgetChange = (e) => {
    updateState({ budget: parseInt(e.target.value) });
  };

  // Mock breakdown logic
  const budget = state.budget;
  const breakdown = [
    { label: 'Catering', ratio: 0.4, value: budget * 0.4 },
    { label: 'Venue', ratio: 0.15, value: budget * 0.15 },
    { label: 'Photo · Video', ratio: 0.15, value: budget * 0.15 },
    { label: 'Decor · Florals', ratio: 0.1, value: budget * 0.1 },
    { label: 'DJ · Anchor', ratio: 0.075, value: budget * 0.075 },
    { label: 'Other', ratio: 0.125, value: budget * 0.125 },
  ];

  const sliderPercent = ((budget - 5000) / 195000) * 100;

  return (
    <div className="screen-body">
      <div className="s1-header">
        <Link to="/wizard" className="s1-back">←</Link>
        <span className="s1-title-pill">Plan your event · Step 4 of 5</span>
        <Link to="/my-events" className="s1-close">✕</Link>
      </div>
      <div className="s1-progress">
        <span className="done"></span><span className="done"></span><span className="done"></span><span className="done"></span><span></span>
      </div>
      <div className="s1-h">What's your<br/>total budget?</div>
      <div className="s1-sub">We'll automatically suggest vendors that fit.</div>

      <div className="s1-amount"><sup>$</sup>{budget.toLocaleString()}</div>
      
      <div className="s1-slider-container" style={{ padding: '0 24px', position: 'relative', height: '30px', display: 'flex', alignItems: 'center' }}>
        <input 
          type="range" 
          min="5000" 
          max="200000" 
          step="500" 
          value={budget} 
          onChange={handleBudgetChange}
          style={{
            width: '100%',
            height: '100%',
            WebkitAppearance: 'none',
            background: 'transparent',
            outline: 'none',
            position: 'relative',
            zIndex: 10,
            cursor: 'pointer'
          }}
        />
        {/* Custom Slider Track and Fill */}
        <div className="s1-slider" style={{ position: 'absolute', left: '24px', right: '24px', height: '6px', margin: 0, pointerEvents: 'none', background: 'var(--line)', borderRadius: '3px' }}>
           <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${sliderPercent}%`, background: 'var(--brand)', borderRadius: '3px' }}></div>
           <span className="s1-thumb" style={{ left: `${sliderPercent}%`, position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)' }}></span>
        </div>
      </div>
      
      <div className="s1-range"><span>$5K</span><span>$200K+</span></div>

      <div className="s1-breakdown">
        <h5>Estimated breakdown · {state.guests} guests</h5>
        {breakdown.map((item, idx) => (
          <div className="s1-bk-row" key={idx}>
            <span>{item.label}</span>
            <span className="bar"><i style={{width: `${item.ratio * 200}%`, maxWidth: '100%'}}></i></span>
            <span className="val">${Math.round(item.value).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="s1-cta">
        <Link to="/discovery"><button>Continue →</button></Link>
        <p><Link to="/discovery">Skip — I'll figure it out later</Link></p>
      </div>
    </div>
  );
};

export default EventBudgetStep;
