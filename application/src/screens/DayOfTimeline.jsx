import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GripVertical, Plus, Clock, MapPin, Phone, FileText } from 'lucide-react';
import { useApp } from '../AppContext';

// PRD §8.8 — day-of timeline: customer drag-arranges vendor arrival times.
// All confirmed vendors + the customer see this same timeline. Shared notes
// section lives below.
const DEFAULT_BLOCKS = [
  { id: 1, time: '08:00', vendor: 'Crystal Palace',  role: 'Venue access opens',           contact: 'ops@crystalpalace.ca',     notes: 'Use service entrance on west side.' },
  { id: 2, time: '10:00', vendor: 'Bloom & Bough',   role: 'Decor + floral installation',  contact: '+1 (416) 555-0142',        notes: 'Bring step ladder, 12ft truss.' },
  { id: 3, time: '13:00', vendor: 'Tandoor & Co',    role: 'Catering load-in',             contact: '+1 (416) 555-0188',        notes: 'Halal kitchen prep area required.' },
  { id: 4, time: '15:30', vendor: 'DJ Sterling',     role: 'Sound check',                  contact: '+1 (647) 555-0901',        notes: 'Stage left, dedicated 20A circuit.' },
  { id: 5, time: '17:00', vendor: 'Guests arrive',   role: 'Doors open',                   contact: '',                          notes: '' },
  { id: 6, time: '21:30', vendor: 'Catering',        role: 'Dinner service ends',          contact: '',                          notes: 'Cake-cutting at 21:45.' },
  { id: 7, time: '23:30', vendor: 'All vendors',     role: 'Load-out + venue close',       contact: '',                          notes: '' }
];

const DayOfTimeline = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [notes, setNotes] = useState(
    'Vegetarian table on the left. Please refer dietary questions to the bride\'s mom (contact pinned in chat).'
  );

  const eventDate = state.event?.date
    ? new Date(state.event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Aug 15, 2026';

  const onDragStart = (id) => () => setDragId(id);
  const onDragOver = (id) => (e) => { e.preventDefault(); setOverId(id); };
  const onDrop = (id) => (e) => {
    e.preventDefault();
    if (dragId === null || dragId === id) { setDragId(null); setOverId(null); return; }
    const next = [...blocks];
    const from = next.findIndex(b => b.id === dragId);
    const to   = next.findIndex(b => b.id === id);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBlocks(next);
    setDragId(null); setOverId(null);
  };

  // For touch / mobile we expose explicit up/down buttons since HTML5 drag
  // doesn't fire on touch screens.
  const move = (id, delta) => setBlocks(prev => {
    const idx = prev.findIndex(b => b.id === id);
    const target = idx + delta;
    if (target < 0 || target >= prev.length) return prev;
    const next = [...prev];
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });

  return (
    <div className="screen-body">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h6 style={{ margin: 0, fontSize: 16 }}>Day-of Timeline</h6>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>{eventDate}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={12} /> Drag to reorder — confirmed vendors see updates live.
        </p>

        {blocks.map((b, i) => (
          <div
            key={b.id}
            draggable
            onDragStart={onDragStart(b.id)}
            onDragOver={onDragOver(b.id)}
            onDrop={onDrop(b.id)}
            onDragEnd={() => { setDragId(null); setOverId(null); }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: 12, marginBottom: 8, borderRadius: 12,
              border: overId === b.id ? '2px dashed var(--primary)' : '1px solid var(--line)',
              background: dragId === b.id ? '#F8FAFC' : 'white',
              opacity: dragId === b.id ? 0.6 : 1,
              cursor: 'grab'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 28 }}>
              <GripVertical size={16} color="var(--faint)" />
              <button onClick={() => move(b.id, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', padding: 2, color: i === 0 ? 'var(--faint)' : 'var(--muted)' }}>▲</button>
              <button onClick={() => move(b.id,  1)} disabled={i === blocks.length - 1} style={{ background: 'none', border: 'none', cursor: i === blocks.length - 1 ? 'not-allowed' : 'pointer', padding: 2, color: i === blocks.length - 1 ? 'var(--faint)' : 'var(--muted)' }}>▼</button>
            </div>

            <div style={{ minWidth: 48 }}>
              <input
                type="time"
                value={b.time}
                onChange={(e) => setBlocks(prev => prev.map(x => x.id === b.id ? { ...x, time: e.target.value } : x))}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: 14, color: 'var(--ink)', width: 64, padding: 0 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{b.vendor}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{b.role}</div>
              {b.contact && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={10} /> {b.contact}
                </div>
              )}
              {b.notes && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
                  {b.notes}
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => setBlocks(prev => [...prev, { id: Date.now(), time: '12:00', vendor: 'New block', role: '', contact: '', notes: '' }])}
          style={{
            width: '100%', padding: 12, borderRadius: 12,
            border: '2px dashed var(--line)', background: 'transparent',
            color: 'var(--muted)', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', marginBottom: 24
          }}
        >
          <Plus size={16} /> Add timeline block
        </button>

        <h3 style={{ fontSize: 15, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} /> Shared notes
        </h3>
        <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 8px' }}>
          Visible to you and every confirmed vendor for this event.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--line)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
        />

        <div style={{ marginTop: 20, padding: 12, borderRadius: 12, background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: 12, color: '#075985', display: 'flex', gap: 10 }}>
          <MapPin size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <b>Venue:</b> Crystal Palace, 800 Lakeshore Blvd, Toronto, ON<br/>
            Loading bay on the south side. Parking validation available.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayOfTimeline;
