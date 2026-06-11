import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

const STAT_ICONS = { earnings: TrendingUp, bookings: Calendar, inquiries: MessageSquare };
const STAT_COLORS = { earnings: '#10B981', bookings: '#3B82F6', inquiries: '#F59E0B' };

const CreatorDashboard = () => {
  const { state } = useApp();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState([
    { id: 'earnings',  label: 'Total Earnings',  value: '$0' },
    { id: 'bookings',  label: 'Active Bookings', value: '0'  },
    { id: 'inquiries', label: 'Inquiries',       value: '0'  }
  ]);
  const [recentBookings, setRecentBookings] = React.useState([]);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      if (!state.user?.id) { setLoading(false); return; }
      try {
        const { data: recent, error } = await supabase
          .from('bookings')
          .select('id, status, amount, event_id, created_at, package_id')
          .eq('vendor_id', state.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) throw error;
        const list = recent || [];
        const earned = list.reduce((s, b) => s + (b.amount || 0), 0);
        const active = list.filter(b => b.status === 'confirmed').length;
        const pending = list.filter(b => b.status === 'pending').length;
        setStats([
          { id: 'earnings',  label: 'Total Earnings',  value: '$' + earned.toLocaleString() },
          { id: 'bookings',  label: 'Active Bookings', value: String(active) },
          { id: 'inquiries', label: 'Inquiries',       value: String(pending) }
        ]);
        setRecentBookings(list);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [state.user?.id]);

  const userName = state.user?.user_metadata?.full_name || state.user?.name || 'Vendor';

  return (
    <div className="screen-body theme-creator">
      <div style={{ padding: '24px 20px 10px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
          Welcome back, <b>{userName}</b>
        </p>
      </div>

      <div style={{ padding: '0 20px', marginBottom: '12px' }}>
        <Link to="/portfolio" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, #7d1230 100%)',
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px' }}>Portfolio Strength: 85%</h4>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>Tap to optimize</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
        </Link>
      </div>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {stats.map((stat, idx) => {
          const Icon = STAT_ICONS[stat.id];
          const color = STAT_COLORS[stat.id];
          const card = (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ color: color }}><Icon size={20} /></div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>{stat.value}</div>
            </div>
          );
          if (stat.id === 'inquiries') {
            return (
              <Link key={stat.id} to="/inquiries" style={{ textDecoration: 'none', color: 'inherit', gridColumn: 'span 1' }}>
                {card}
              </Link>
            );
          }
          return (
            <div key={stat.id} style={{ gridColumn: idx === 0 ? 'span 2' : 'span 1' }}>
              {card}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent Bookings</h3>
          <Link to="/inquiries" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" color="var(--primary)" />
          </div>
        ) : recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>
            No bookings yet. Share your profile to attract leads.
          </div>
        ) : (
          recentBookings.map(booking => (
            <div key={booking.id} className="s4-card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h6 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{booking.planner_name || 'Planner'}</h6>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>${(booking.amount || 0).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 12px' }}>
                {booking.event || 'Event'} · {booking.date || new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${booking.status === 'confirmed' ? 'badge-available' : 'badge-amber'}`}>{booking.status}</span>
                <Link to="/messages" style={{ textDecoration: 'none' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Message planner &rarr;</button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
