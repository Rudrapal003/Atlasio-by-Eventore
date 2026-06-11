import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Check, X, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('id, business_name, category, created_at')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching pending vendors:', error);
    } else {
      setPendingVendors(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('vendors')
      .update({ is_approved: true })
      .eq('id', id);
      
    if (!error) {
      setPendingVendors(prev => prev.filter(v => v.id !== id));
      alert('Vendor approved successfully!');
    } else {
      alert('Failed to approve vendor.');
    }
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setPendingVendors(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div style={{ padding: '40px', background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', marginBottom: '8px' }}>Eventore Admin</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Vendor Approval Queue</p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="animate-spin" color="var(--primary)" />
        </div>
      ) : pendingVendors.length === 0 ? (
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
          No vendors pending approval.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingVendors.map(vendor => (
            <div key={vendor.id} style={{ 
              background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', 
              padding: '24px', borderRadius: '16px', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{vendor.business_name}</h3>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{vendor.category} • Applied {new Date(vendor.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleReject(vendor.id)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  <X size={16} /> Reject
                </button>
                <button 
                  onClick={() => handleApprove(vendor.id)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--green)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
