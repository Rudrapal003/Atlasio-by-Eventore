import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Loader2, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

const MyEvents = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'Wedding', budget: '' });
  const [loading, setLoading] = useState(false);

  // Fetch real events from Supabase on mount
  useEffect(() => {
    if (!state.user?.id) return;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', state.user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          updateState({ events: data });
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.id]);

  // Build the events list: real events + wizard event if not already persisted
  const events = [...(state.events || [])];
  if (state.event?.title && !events.some(e => e.title === state.event.title)) {
    events.unshift({
      id: 'wizard_event',
      title: state.event.title,
      date: state.event.date
        ? new Date(state.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'TBD',
      vendors: state.bookings?.length || 0,
      budget: state.event.budget || 0,
      type: state.event.type || 'Event'
    });
  }

  const handleAddEvent = async () => {
    if (!newEvent.title) return;
    const budget = parseFloat(newEvent.budget) || 5000;
    const added = {
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type,
      budget,
      vendors: 0,
      user_id: state.user?.id
    };

    // Persist to Supabase
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(added)
        .select()
        .single();
      if (!error && data) {
        updateState({ events: [data, ...events] });
      } else {
        // Fallback: optimistic update with temp id
        updateState({ events: [{ ...added, id: Date.now() }, ...events] });
      }
    } catch {
      updateState({ events: [{ ...added, id: Date.now() }, ...events] });
    }

    setShowAddModal(false);
    setNewEvent({ title: '', date: '', type: 'Wedding', budget: '' });
  };

  const formatDate = (d) => {
    if (!d) return 'TBD';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div className="screen-body" style={{ background: '#FBF9F4' }}>
      <div style={{ padding: '24px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>My Events</h1>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={24} />
        </button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: '10px', marginTop: '10px' }}>
        <span className="pill active">Upcoming</span>
        <span className="pill">Past</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" color="var(--primary)" size={32} />
          </div>
        ) : (
          <>
            {events.map(event => (
              <div key={event.id} className="s4-card" style={{ marginBottom: '16px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--line)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{event.type}</span>
                    </div>
                    <h6 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: 'var(--ink)' }}>{event.title}</h6>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>{formatDate(event.date)}</p>
                  </div>
                  <ChevronRight size={20} color="var(--line-strong)" />
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Budget: <b>${(event.budget || 0).toLocaleString()}</b></div>
                  <Link to="/discovery" style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>
                </div>
                {event.vendors > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--line)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to="/timeline" style={{ flex: 1, minWidth: 90, textAlign: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Day-of timeline</Link>
                    <Link to="/cart" style={{ flex: 1, minWidth: 90, textAlign: 'center', padding: '8px 10px', borderRadius: 8, background: '#F1F5F9', color: 'var(--ink)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Add more vendors</Link>
                    <Link to="/review" style={{ flex: 1, minWidth: 90, textAlign: 'center', padding: '8px 10px', borderRadius: 8, background: '#F1F5F9', color: 'var(--ink)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Leave review</Link>
                    <Link to="/dispute" style={{ flex: 1, minWidth: 90, textAlign: 'center', padding: '8px 10px', borderRadius: 8, background: '#FEF3F2', color: '#B42318', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Open dispute</Link>
                  </div>
                )}
              </div>
            ))}

            <Link to="/wizard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                border: '2px dashed var(--line)', borderRadius: 'var(--radius-md)',
                padding: '24px', textAlign: 'center', color: 'var(--muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer'
              }}>
                <Plus size={24} />
                <span style={{ fontWeight: 500 }}>Plan a new event</span>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRadius: '24px 24px 0 0',
            padding: '28px 24px', width: '100%', maxWidth: 480
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 20 }}>New Event</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Event Name *</label>
                <input
                  value={newEvent.title}
                  onChange={e => setNewEvent(n => ({ ...n, title: e.target.value }))}
                  placeholder="e.g. Sarah & James Wedding"
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 15, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={e => setNewEvent(n => ({ ...n, type: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 15, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}
                >
                  {['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Baby Shower', 'Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 15, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Budget ($)</label>
                <input
                  type="number"
                  value={newEvent.budget}
                  onChange={e => setNewEvent(n => ({ ...n, budget: e.target.value }))}
                  placeholder="e.g. 25000"
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 15, boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.title}
                className="btn btn-primary"
                style={{ marginTop: 8, justifyContent: 'center', opacity: newEvent.title ? 1 : 0.5 }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
