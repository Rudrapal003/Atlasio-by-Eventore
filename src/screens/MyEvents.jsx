import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, MessageSquare, User, Plus, X, ChevronRight } from 'lucide-react';
import { useApp } from '../App';

const MyEvents = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'Wedding' });

  const events = state.events || [
    { id: 1, title: "Priya & Arjun's Wedding", date: "Aug 15, 2026", vendors: 3, budget: 60000, type: 'Wedding' },
    { id: 2, title: "Corporate Summer Gala", date: "Jun 20, 2026", vendors: 0, budget: 15000, type: 'Corporate' }
  ];

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    const added = { ...newEvent, id: Date.now(), vendors: 0, budget: 5000 };
    updateState({ events: [added, ...events] });
    setShowAddModal(false);
    setNewEvent({ title: '', date: '', type: 'Wedding' });
  };

  return (
    <div className="screen-body" style={{ background: '#FBF9F4' }}>
      <div style={{ padding: '24px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>My Events</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={24} />
        </button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: '10px', marginTop: '10px' }}>
        <span className="pill active">Upcoming</span>
        <span className="pill">Past</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {events.map(event => (
          <div key={event.id} className="s4-card" style={{ marginBottom: '16px', background: 'white', border: '1px solid var(--line)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                   <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{event.type}</span>
                </div>
                <h6 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: 'var(--ink)' }}>{event.title}</h6>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>{event.date}</p>
              </div>
              <ChevronRight size={20} color="var(--line-strong)" />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Budget: <b>${event.budget.toLocaleString()}</b></div>
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
            border: '2px dashed var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <Plus size={24} />
            <span style={{ fontWeight: 500 }}>Plan a new event</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MyEvents;
