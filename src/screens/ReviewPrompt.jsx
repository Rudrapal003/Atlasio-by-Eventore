import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';

// PRD §8.7 — post-event review prompt, served 24h after event date.
// Reviews tied to a real Evently booking get the verified-by-booking badge.
const STRUCTURED_TAGS = [
  'On time', 'Great communication', 'Exceeded expectations', 'Worth the price',
  'Punctual setup', 'Professional team', 'Tasty / well-prepared', 'Clean-up was thorough'
];

const ReviewPrompt = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const vendor = state.selectedVendor || { name: 'Tandoor & Co' };

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (t) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  if (submitted) {
    return (
      <div className="screen-body" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Check size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '0 0 8px' }}>Thanks for reviewing!</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}>
          Your review of <b>{vendor.name}</b> will go live within a few minutes. It includes the
          <span style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600, padding: '2px 8px', borderRadius: 999, margin: '0 4px', fontSize: 12 }}>✓ Verified</span>
          badge since you booked through Evently.
        </p>
        <button
          onClick={() => navigate('/my-events')}
          style={{ marginTop: 24, width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="screen-body">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <h6 style={{ margin: 0, fontSize: 16 }}>Rate your experience</h6>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Vendor header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundImage: `url(${vendor.image || ''})`, backgroundSize: 'cover', background: vendor.image ? undefined : 'var(--primary-soft)' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{vendor.name}</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} color="var(--primary)" />
              You booked them on Evently
            </p>
          </div>
        </div>

        {/* Star rating */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', margin: '0 0 8px' }}>How was it?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0 16px' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontSize: 44, lineHeight: 1,
                color: (hover || rating) >= n ? '#F59E0B' : '#E5E7EB'
              }}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
            >★</button>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', margin: '0 0 24px' }}>
          {rating === 0 && 'Tap a star to rate'}
          {rating === 1 && 'Strongly disappointed'}
          {rating === 2 && 'Below expectations'}
          {rating === 3 && 'Met expectations'}
          {rating === 4 && 'Above expectations'}
          {rating === 5 && 'Loved it'}
        </p>

        {/* Tags */}
        {rating >= 4 && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', margin: '0 0 8px' }}>What stood out?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {STRUCTURED_TAGS.map(t => {
                const on = tags.includes(t);
                return (
                  <span key={t} onClick={() => toggleTag(t)} style={{
                    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`,
                    background: on ? 'var(--primary-soft)' : 'white',
                    color: on ? 'var(--primary)' : 'var(--muted)',
                    cursor: 'pointer'
                  }}>{t}</span>
                );
              })}
            </div>
          </>
        )}

        {/* Free text */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', margin: '0 0 8px' }}>
          {rating <= 3 ? 'Tell us what went wrong' : 'Tell other planners about it (optional)'}
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={rating <= 3 ? 'Specifics help us improve the marketplace…' : 'What would you want a friend to know?'}
          rows={4}
          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
        />

        {/* Photos */}
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginTop: 16, padding: 14, borderRadius: 12, border: '2px dashed var(--line)',
          background: '#FBFBFB', cursor: 'pointer'
        }}>
          <Camera size={18} color="var(--muted)" />
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
            {photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} attached` : 'Add photos (optional)'}
          </span>
          <input
            type="file" multiple accept="image/*"
            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
            style={{ display: 'none' }}
          />
        </label>

        {rating <= 3 && rating > 0 && (
          <div style={{ marginTop: 16, padding: 12, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, fontSize: 12, color: '#9A3412', lineHeight: 1.5 }}>
            <b>Considering filing a dispute?</b> If this was a meaningful issue (no-show, damage, double-charge), you can also <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/dispute')}>open a formal dispute</span>.
          </div>
        )}
      </div>

      <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)', background: 'white' }}>
        <button
          onClick={() => setSubmitted(true)}
          disabled={rating === 0}
          style={{
            width: '100%', padding: 14, borderRadius: 12,
            background: 'var(--primary)', color: 'white', border: 'none',
            fontWeight: 600, fontSize: 15, cursor: rating ? 'pointer' : 'not-allowed', opacity: rating ? 1 : 0.5
          }}
        >
          Submit review
        </button>
      </div>
    </div>
  );
};

export default ReviewPrompt;
