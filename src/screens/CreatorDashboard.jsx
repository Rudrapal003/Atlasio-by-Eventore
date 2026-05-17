import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MessageSquare, User, TrendingUp, Users, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';

const CreatorDashboard = () => {
  const { state } = useApp();
  const [loading, setLoading] = React.useState(true);
  const [dashboardData, setDashboardData] = React.useState({
    stats: [
      { label: 'Total Earnings', value: '$0', icon: <TrendingUp size={20} />, color: '#10B981', trend: '0%' },
      { label: 'Active Bookings', value: '0', icon: <Calendar size={20} />, color: '#3B82F6', trend: '0' },
      { label: 'Inquiries', value: '0', icon: <MessageSquare size={20} />, color: '#F59E0B', trend: '0' }
    ],
    recentBookings: []
  });

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!state.user?.id) return;

      try {
        // 1. Fetch Inquiries count
        const { count: inquiryCount } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', state.user.id);

        // 2. Fetch Bookings count and amount
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('vendor_id', state.user.id);

        const totalEarnings = bookingsData?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;
        const activeBookings = bookingsData?.length || 0;

        // 3. Fetch recent bookings with planner details
        const { data: recent } = await supabase
          .from('bookings')
          .select('*, profiles(full_name, avatar_url)')
          .eq('vendor_id', state.user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setDashboardData({
          stats: [
            { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#10B981', trend: '+0%' },
            { label: 'Active Bookings', value: activeBookings.toString(), icon: <Calendar size={20} />, color: '#3B82F6', trend: '0' },
            { label: 'Inquiries', value: (inquiryCount || 0).toString(), icon: <MessageSquare size={20} />, color: '#F59E0B', trend: '+0' }
          ],
          recentBookings: recent || []
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [state.user?.id]);

  return (
    <div className="screen-body theme-creator" style={{ background: '#F8FAFC' }}>
      <div style={{ padding: '24px 20px 10px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>Welcome back, <b>{state.user?.name || 'Chef Rahul'}</b></p>
      </div>

      <div style={{ padding: '0 20px', marginBottom: '12px' }}>
        <div style={{ 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)', 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(5,150,105,0.2)'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Portfolio Strength: 85%</h4>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>Google & Instagram connected</p>
          </div>
          <Link to="/portfolio" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>Optimize</Link>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {dashboardData.stats.map((stat, idx) => {
          const content = (
            <div style={{ 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              background: 'white', 
              border: '1px solid var(--line)',
              gridColumn: idx === 0 ? 'span 2' : 'span 1',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              height: '100%',
              cursor: stat.label === 'Inquiries' ? 'pointer' : 'default'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ color: stat.color, background: `${stat.color}15`, padding: '8px', borderRadius: '10px' }}>{stat.icon}</div>
                <span style={{ fontSize: '11px', color: stat.trend.startsWith('+') ? '#10B981' : 'var(--muted)', fontWeight: 700 }}>{stat.trend}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginBottom: '2px' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>{stat.value}</div>
            </div>
          );

          if (stat.label === 'Inquiries') {
            return <Link key={idx} to="/inquiries" style={{ textDecoration: 'none', color: 'inherit', gridColumn: 'span 1' }}>{content}</Link>;
          }
          return <div key={idx} style={{ gridColumn: idx === 0 ? 'span 2' : 'span 1' }}>{content}</div>;
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent Bookings</h3>
          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>View all</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : dashboardData.recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>No bo