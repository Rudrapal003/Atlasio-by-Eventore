import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';

const Inquiries = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInquiries = async () => {
      if (!state.user?.id) return;
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*, profiles(full_name), events(type, title, date, guests, location)')
          .eq('vendor_id', state.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInquiries(data || []);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [state.user?.id]);

  const handleAction = async (id, action) => {
    try {
      const status = action === 'accept' ? 'accepted' : 'declined';
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
      alert(`Inquiry ${status}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="screen-body theme-creator">
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0 }}>
          <ArrowLeft size={24} color="var(--ink)" />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Inquiries</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : inquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>No inquiries yet</div>
        ) : inquiries.map(inq => (
          <div key={inq.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--line)', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>{inq.profiles?.full_name || 'Anonymous'}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>{inq.events?.type || 'Event'} · {inq.events?.date || 'TBD'}</p>
              </div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: inq.status === 'accepted' ? 'var(--green)' : inq.status === 'declined' ? 'var(--rose)' : 'var(--primary)', 
                background: inq.status === 'accepted' ? 'var(--green-soft)' : inq.status === 'declined' ? '#FEE2E2' : 'var(--primary-soft)'
              }}>{inq.status || 'New'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inquiries;
