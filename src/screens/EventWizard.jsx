import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Cake, Briefcase, Sparkles, MoreHorizontal, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';

// Popular Canadian metros for one-tap selection — covers ~75% of national event spend.
const POPULAR_CITIES = [
  'Toronto, ON',
  'Mississauga, ON',
  'Brampton, ON',
  'Markham, ON',
  'Ottawa, ON',
  'Hamilton, ON',
  'Vancouver, BC',
  'Surrey, BC',
  'Calgary, AB',
  'Edmonton, AB',
  'Montreal, QC',
  'Quebec City, QC',
  'Winnipeg, MB',
  'Halifax, NS'
];

// Universal event-creation flow. Every event type uses the same 5 steps:
//   type → date → guests → budget → location (+ optional cultural tags).
// Only vendor *discovery* branches per event type (handled downstream).
const EVENT_TYPES = [
  { id: 'wedding',   label: 'Wedding',   icon: Heart,      hint: 'Engagement, ceremony, reception' },
  { id: 'birthday',  label: 'Birthday',  icon: Cake,       hint: 'Kids, milestone, dinners' },
  { id: 'corporate', label: 'Corporate', icon: Briefcase,  hint: 'Offsite, launch, holiday party' },
  { id: 'cultural',  label: 'Cultural',  icon: Sparkles,   hint: 'Diwali, Eid, Quinceañera, Lunar New Year' },
  { id: 'other',     label: 'Other',     icon: MoreHorizontal, hint: 'Anything else' },
];

// Guest-count steps differ per event type — universal flow, parameterised.
const GUEST_STEPS = {
  wedding:   [50, 100, 150, 250, 500],
  birthday:  [10, 25, 50, 100, 250],
  corporate: [20, 50, 100, 250, 500],
  cultural:  [25, 50, 100, 250, 500],
  other:     [10, 25, 50, 100, 250]
};

const BUDGET_RANGES = {
  wedding:   { min: 5000,  max: 200000, step: 1000, default: 60000 },
  birthday:  { min: 200,   max: 20000,  step: 100,  default: 3000 },
  corporate: { min: 2000,  max: 100000, step: 500,  default: 15000 },
  cultural:  { min: 1000,  max: 80000,  step: 500,  default: 12000 },
  other:     { min: 500,   max: 50000,  step: 250,  default: 5000 }
};

const CULTURAL_TAGS = [
  'South Asian', 'East Asian', 'Latino', 'Middle Eastern', 'African', 'Jewish',
  'Halal', 'Kosher', 'Vegetarian', 'Vegan', 'Gluten-free'
];

const EventWizard = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const ev = state.event || {};

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [draft, setDraft] = useState({
    type: ev.type || null,
    title: ev.title || '',
    date: ev.date || '',
    guests: ev.guests || 100,
    budget: ev.budget || 60000,
    location: ev.location || '',
    culturalTags: ev.culturalTags || []
  });

  // Re-derive guest + budget defaults when event type changes.
  const update = (patch) => setDraft(d => {
    const next = { ...d, ...patch };
    if (patch.type && patch.type !== d.type) {
      const gSteps = GUEST_STEPS[patch.type];
      const bRange = BUDGET_RANGES[patch.type];
      next.guests = gSteps[Math.floor(gSteps.length / 2)];
      next.budget = bRange.default;
    }
    return next;
  });

  const total = 5;
  const back = () => step > 1 ? setStep(step - 1) : navigate('/my-events');
  const canAdvance = useMemo(() => {
    if (step === 1) return !!draft.type;
    if (step === 2) return !!draft.date;
    if (step === 3) return draft.guests > 0;
    if (step === 4) return draft.budget > 0;
    if (step === 5) return draft.location.trim().length > 1;
    return false;
  }, [step, draft]);

  const finish = async () => {
    if (!state.user?.id) {
      setError('Please sign in to save your event.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const title = draft.title || titleFor(draft);
      
      const { data, error: insertError } = await supabase
        .from('events')
        .insert([
          {
            planner_id: state.user.id,
            type: draft.type,
            title: title,
            date: draft.date,
            guests: draft.guests,
            budget: draft.budget,
            location: draft.location,
            cultural_tags: draft.culturalTags
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      updateState({
        event: data,
        guests: draft.guests,
        budget: draft.budget
      });
      
      navigate('/discovery');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const next = () => step < total ? setStep(step + 1) : finish();

  const bRange = BUDGET_RANGES[draft.type || 'wedding'];
  const gSteps = GUEST_STEPS[draft.type || 'wedding'];

  // "Use my location" — browser geolocation + OpenStreetMap reverse geocode.
  // Uses Nominatim which is free with no API key. Falls back gracefully to
  // coordinates if the network call fails so we never strand the user.
  const detectLocation = async () => {
    setLocateError('');
    if (!navigator.geolocation) {
      setLocateError('Location is not supported in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`,
          { headers: { 'Accept': 'application/json' } }
        );
        const json = await res.json();
        const a = json.address || {};
        const city = a.city || a.town || a.village || a.county || '';
        const stateAbbr = a['ISO3166-2-lvl4'] ? a['ISO3166-2-lvl4'].split('-')[1] : (a.state || '');
        const label = [city, stateAbbr].filter(Boolean).join(', ');
        update({ location: label || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}` });
      } catch (e) {
        update({ location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)} (detected)` });
      } finally {
        setLocating(false);
      }
    }, (err) => {
      setLocating(false);
      const msg = err.code === 1
        ? 'Location permission denied — type a city instead.'
        : err.code === 2
        ? "Couldn't determine your position — type a city instead."
        : 'Location timed out — type a city instead.';
      setLocateError(msg);
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
  };

  return (
    <div className="screen-body" style={{ padding: 0 }}>
      {/* Header + progress */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={22} color="var(--ink)" />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
          Step {step} of {total}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px 4px' }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < step ? 'var(--primary)' : 'var(--line)'
          }} />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 20px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {step === 1 && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '12px 0 6px' }}>What are you planning?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Pick the event type — we'll tailor vendor categories and budget guidance.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {EVENT_TYPES.map(t => {
                const Icon = t.icon;
                const selected = draft.type === t.id;
                return (
                  <div key={t.id} onClick={() => update({ type: t.id })} style={{
                    padding: 16, borderRadius: 14,
                    border: `2px solid ${selected ? 'var(--primary)' : 'var(--line)'}`,
                    background: selected ? 'var(--primary-soft)' : 'white',
                    cursor: 'pointer', transition: 'all 0.15s',
                    gridColumn: t.id === 'other' ? 'span 2' : 'span 1'
                  }}>
                    <Icon size={26} color={selected ? 'var(--primary)' : 'var(--ink)'} />
                    <h4 style={{ margin: '10px 0 4px', fontSize: 15 }}>{t.label}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{t.hint}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '12px 0 6px' }}>When is it?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Vendor availability is matched to this date.</p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Event date</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => update({ date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--line)', fontSize: 15 }}
            />
            <label style={{ display: 'block', marginTop: 20, fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>
              Give your event a name (optional)
            </label>
            <input
              type="text"
              placeholder={titleFor(draft) || "Priya & Arjun's Wedding"}
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--line)', fontSize: 15 }}
            />
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '12px 0 6px' }}>How many guests?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>An estimate is fine — you can refine later.</p>

            {/* Big editable count display — type any number you want */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '12px 0' }}>
              <button
                onClick={() => update({ guests: Math.max(1, (draft.guests || 1) - 1) })}
                style={{ width: 36, height: 36, borderRadius: 18, border: '1px solid var(--line)', background: 'white', fontSize: 22, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}
                aria-label="Decrease"
              >−</button>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="10000"
                value={draft.guests}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') { update({ guests: '' }); return; }
                  const n = parseInt(v, 10);
                  if (!Number.isNaN(n) && n >= 0) update({ guests: Math.min(n, 10000) });
                }}
                onBlur={() => {
                  if (!draft.guests || draft.guests < 1) update({ guests: 1 });
                }}
                style={{
                  width: 140, padding: '8px 0', textAlign: 'center',
                  fontSize: 44, fontWeight: 700, color: 'var(--primary)',
                  border: 'none', borderBottom: '2px solid var(--line)',
                  background: 'transparent', outline: 'none'
                }}
              />
              <button
                onClick={() => update({ guests: Math.min(10000, (draft.guests || 0) + 1) })}
                style={{ width: 36, height: 36, borderRadius: 18, border: '1px solid var(--line)', background: 'white', fontSize: 22, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}
                aria-label="Increase"
              >+</button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 0 }}>guests</p>

            {/* Quick-pick chips — tap to jump to a common size */}
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 20, marginBottom: 8 }}>Quick picks</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {gSteps.map(g => (
                <button key={g} onClick={() => update({ guests: g })} style={{
                  padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line)',
                  background: draft.guests === g ? 'var(--ink)' : 'white',
                  color: draft.guests === g ? 'white' : 'var(--ink)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer'
                }}>{g}</button>
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 20, marginBottom: 4 }}>Or drag the slider</p>
            <input
              type="range"
              min="1" max={gSteps[gSteps.length - 1] * 2} step="1"
              value={draft.guests || 1}
              onChange={(e) => update({ guests: parseInt(e.target.value, 10) })}
              style={{ width: '100%' }}
            />
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '12px 0 6px' }}>What's your total budget?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>We'll only show vendors that fit.</p>
            <div style={{ fontSize: 44, fontWeight: 700, color: 'var(--primary)', textAlign: 'center', margin: '12px 0' }}>
              ${draft.budget.toLocaleString()}
            </div>
            <input
              type="range"
              min={bRange.min} max={bRange.max} step={bRange.step}
              value={draft.budget}
              onChange={(e) => update({ budget: parseInt(e.target.value, 10) })}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
              <span>${bRange.min.toLocaleString()}</span>
              <span>${bRange.max.toLocaleString()}+</span>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '12px 0 6px' }}>Where is it?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>Detect, pick a city, or type your own.</p>

            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              style={{
                width: '100%', padding: 12, borderRadius: 12,
                border: '1px solid var(--primary)', background: 'var(--primary-soft)',
                color: 'var(--primary)', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: locating ? 'wait' : 'pointer', marginBottom: 10, opacity: locating ? 0.7 : 1
              }}
            >
              {locating
                ? (<><Loader2 size={16} className="animate-spin" /> Locating you…</>)
                : (<><MapPin size={16} /> Use my current location</>)}
            </button>
            {locateError && (
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#B91C1C' }}>{locateError}</p>
            )}

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, marginTop: 6 }}>
              City or postal code
            </label>
            <input
              type="text"
              placeholder="e.g. Mississauga, ON or L5B 4H3"
              value={draft.location}
              onChange={(e) => update({ location: e.target.value })}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--line)', fontSize: 15 }}
            />

            <h4 style={{ marginTop: 20, marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
              Popular metros
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {POPULAR_CITIES.map(city => {
                const on = draft.location === city;
                return (
                  <span key={city}
                    onClick={() => update({ location: city })}
                    style={{
                      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`,
                      background: on ? 'var(--primary-soft)' : 'white',
                      color: on ? 'var(--primary)' : 'var(--ink)',
                      cursor: 'pointer'
                    }}>{city}</span>
                );
              })}
            </div>

            <h4 style={{ marginTop: 24, marginBottom: 8, fontSize: 14 }}>Cultural tags (optional)</h4>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>
              Helps us surface vendors who specialise in your traditions and dietary needs.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CULTURAL_TAGS.map(tag => {
                const on = draft.culturalTags.includes(tag);
                return (
                  <span key={tag}
                    onClick={() => update({
                      culturalTags: on
                        ? draft.culturalTags.filter(t => t !== tag)
                        : [...draft.culturalTags, tag]
                    })}
                    style={{
                      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`,
                      background: on ? 'var(--primary-soft)' : 'white',
                      color: on ? 'var(--primary)' : 'var(--muted)',
    