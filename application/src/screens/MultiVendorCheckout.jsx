import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, X, Check } from 'lucide-react';
import { useApp } from '../AppContext';

// PRD §7.4 / V1.5 — book caterer + decor + DJ + photographer in a single transaction.
// This is the "OpenTable-for-events" proof point and the V1.5 moat differentiator.
const SAMPLE_CART = [
  { id: 1, name: 'Tandoor & Co',  category: 'Catering',     package: 'Royal Buffet Package',     perGuest: 85,  flat: null, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop' },
  { id: 2, name: 'Bloom & Bough', category: 'Decor',        package: 'Modern Florals · Premium', perGuest: null, flat: 2500, image: 'https://images.unsplash.com/photo-1561128290-006dc4827214?w=200&h=200&fit=crop' },
  { id: 3, name: 'DJ Sterling',   category: 'DJ',           package: '6-Hour Reception Set',     perGuest: null, flat: 1800, image: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=200&h=200&fit=crop' }
];

const MultiVendorCheckout = () => {
  const navigate = useNavigate();
  const { state, updateState } = useApp();
  const [cart, setCart] = useState(SAMPLE_CART);
  const [paying, setPaying] = useState(false);
  const guests = state.event?.guests || state.guests || 250;

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const lines = useMemo(() => cart.map(c => {
    const subtotal = c.perGuest ? c.perGuest * guests : c.flat;
    const facilitation = Math.max(subtotal * 0.05, 15);
    const deposit = Math.round(subtotal * 0.20);
    return { ...c, subtotal, facilitation, deposit };
  }), [cart, guests]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const facilitation = lines.reduce((s, l) => s + l.facilitation, 0);
    const hst = facilitation * 0.13;  // HST is on facilitation fee only (PRD §17)
    const deposit = lines.reduce((s, l) => s + l.deposit, 0);
    return { subtotal, facilitation, hst, deposit, total: subtotal + facilitation + hst };
  }, [lines]);

  const pay = () => {
    if (paying) return;
    setPaying(true);
    const bookings = lines.map(l => ({
      id: `bk_${Date.now()}_${l.id}`,
      vendorId: l.id, vendorName: l.name, packageName: l.package,
      deposit: l.deposit, facilitationFee: l.facilitation,
      total: l.subtotal + l.facilitation,
      status: 'confirmed', createdAt: new Date().toISOString()
    }));
    updateState({ bookings: [...(state.bookings || []), ...bookings] });
    setTimeout(() => navigate('/success'), 600);
  };

  if (cart.length === 0) {
    return (
      <div className="screen-body" style={{ padding: 24, justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Your cart is empty.</p>
        <button onClick={() => navigate('/discovery')} style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Browse vendors
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
        <h6 style={{ margin: 0, fontSize: 16, flex: 1 }}>Multi-vendor checkout</h6>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cart.length} vendors</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ padding: 10, background: 'var(--primary-soft)', borderRadius: 10, marginBottom: 16, fontSize: 12, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} /> Confirming all vendors at once for {guests} guests on your event date.
        </div>

        {lines.map(l => (
          <div key={l.id} className="s4-card" style={{ marginBottom: 12, position: 'relative' }}>
            <button
              onClick={() => removeFromCart(l.id)}
              style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, border: 'none', background: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={`Remove ${l.name}`}
            >
              <X size={12} color="var(--muted)" />
            </button>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, backgroundImage: `url(${l.image})`, backgroundSize: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', margin: 0, letterSpacing: 0.5 }}>{l.category}</p>
                <h6 style={{ margin: '2px 0', fontSize: 14, fontWeight: 700 }}>{l.name}</h6>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{l.package}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>${l.subtotal.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {l.perGuest ? `$${l.perGuest}/guest` : 'flat'}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 10, paddingTop: 8, fontSize: 11, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Deposit now (20%)</span>
              <b style={{ color: 'var(--ink)' }}>${l.deposit.toLocaleString()}</b>
            </div>
          </div>
        ))}

        <div className="s4-card" style={{ marginTop: 8 }}>
          <div className="label">Order summary</div>
          <div className="s4-row"><span>Subtotal (all packages)</span><span className="v">${totals.subtotal.toLocaleString()}</span></div>
          <div className="s4-row"><span>Eventore Facilitation Fee (5%)</span><span className="v">${Math.round(totals.facilitation).toLocaleString()}</span></div>
          <div className="s4-row muted"><span>HST on facilitation fee (13%)</span><span className="v">${Math.round(totals.hst).toLocaleString()}</span></div>
          <div className="s4-total">
            <span className="k">Total amount</span>
            <span className="v">${Math.round(totals.total).toLocaleString()}</span>
          </div>
        </div>

        <div className="s4-card" style={{ marginTop: 8 }}>
          <div className="label">Payment plan</div>
          <div className="s4-row"><span>Deposits due now (combined)</span><span className="v">${totals.deposit.toLocaleString()}</span></div>
          <div className="s4-balance" style={{ background: 'var(--primary-soft)', padding: 10, borderRadius: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ink)' }}>
              Each vendor must accept within <b>24 hours</b>. If any vendor declines, only their portion is refunded — the rest stays confirmed.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12, padding: 10, background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, fontSize: 11, color: '#075985' }}>
          <Clock size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <b>Backup vendor guarantee:</b> if any confirmed vendor cancels, Eventore sources a replacement within 4 hours.
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)' }}>
        <button
          onClick={pay}
          disabled={paying}
          style={{
            width: '100%', padding: 14, borderRadius: 12,
            background: 'var(--primary)', color: 'white', border: 'none',
            fontWeight: 600, fontSize: 15, cursor: paying ? 'wait' : 'pointer',
            opacity: paying ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          {paying ? 'Processing…' : (<><Check size={16} /> Pay deposits · ${totals.deposit.toLocaleString()}</>)}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', margin: '8px 0 0' }}>
          By booking, you agree to our Terms of Service and each vendor's cancellation policy.
        </p>
      </div>
    </div>
  );
};

export default MultiVendorCheckout;
