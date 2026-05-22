import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';

const BookingConfirm = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const { selectedVendor, selectedPackage, guests, event } = state;
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  if (!selectedVendor || !selectedPackage) {
    return (
      <div className="screen-body" style={{ padding: 20, justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Please select a vendor and package first.</p>
        <Link to="/discovery"><button style={{ marginTop: 16 }}>Browse vendors</button></Link>
      </div>
    );
  }

  const packageTotal = selectedPackage.price * guests;
  // PRD §9.1: 5% facilitation fee, floor of $15 per booking.
  const serviceFee = Math.max(packageTotal * 0.05, 15);
  // PRD §17: HST is collected by Evently *on the facilitation fee only*.
  // The vendor remits HST on their own service to CRA.
  const hst = serviceFee * 0.13;
  const total = packageTotal + serviceFee + hst;
  // PRD §8.4: default deposit is 20% of the package, configurable per vendor.
  const deposit = Math.round(packageTotal * 0.20);
  // Balance due 14 days before the event.
  const balanceDueDate = (() => {
    if (!event?.date) return 'event date − 14 days';
    const d = new Date(event.date);
    d.setDate(d.getDate() - 14);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })();

  const handlePay = async () => {
    if (paying || !state.user?.id) return;
    setPaying(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert([
          {
            vendor_id: selectedVendor.id,
            planner_id: state.user.id,
            package_id: selectedPackage.id,
            event_id: event?.id, // Link to the event created in the wizard
            amount: total,
            deposit_amount: deposit,
            status: 'confirmed'
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      updateState({ bookings: [...(state.bookings || []), data] });
      navigate('/success');
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="screen-body">
      <div className="s4-header">
        <Link to="/discovery" style={{color: 'inherit'}}><ArrowLeft size={20} /></Link>
        <h6>Confirm Booking</h6>
        <div style={{width: 20}}></div>
      </div>

      <div className="s4-body" style={{ overflowY: 'auto' }}>
        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '10px', margin: '0 20px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="s4-card">
          <div className="label">Vendor & Package</div>
          <div className="s4-summary">
            <div className="thumb" style={{backgroundImage: `url('${selectedVendor.image}')`}}></div>
            <div>
              <h6>{selectedVendor.name}</h6>
              <p>{selectedPackage.name} · <b>{guests} Guests</b></p>
            </div>
          </div>
        </div>

        <div className="s4-card">
          <div className="label">Price Breakdown</div>
          <div className="s4-row"><span>Package (${selectedPackage.price} × {guests})</span><span className="v">${packageTotal.toLocaleString()}</span></div>
          <div className="s4-row"><span>Evently Facilitation Fee (5%)</span><span className="v">${Math.round(serviceFee).toLocaleString()}</span></div>
          <div className="s4-row muted"><span>HST on facilitation fee (13%)</span><span className="v">${Math.round(hst).toLocaleString()}</span></div>
          <div className="s4-total">
            <span className="k">Total Amount</span>
            <span className="v">${Math.round(total).toLocaleString()}</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            Vendor remits HST on their service directly. Final tax breakdown appears on your receipt.
          </p>
        </div>

        <div className="s4-card">
          <div className="label">Payment Plan</div>
          <div className="s4-row"><span>Deposit due now (20%)</span><span className="v">${deposit.toLocaleString()}</span></div>
          <div className="s4-balance">
            <span>Remaining balance due <b>{balanceDueDate}</b></span>
          </div>
        </div>

        <div className="s4-trust">
          <div className="t">
            <div className="ico"><ShieldCheck size={18} /></div>
            <b>Secure</b>
            <small>Payment</small>
          </div>
          <div className="t">
            <div className="ico"><Clock size={18} /></div>
            <b>48h</b>
            <small>Hold</small>
          </div>
          <div className="t">
            <div className="ico">★</div>
            <b>Evently</b>
            <small>Protect</small>
          </div>
        </div>

        <div className="s4-cta">
          <button onClick={handlePay} disabled={paying} style={{ opacity: paying ? 0.6 : 1, cursor: paying ? 'wait' : 'pointer' }}>
            {paying ? 'Processing…' : `Pay Deposit · $${deposit.toLocaleString()}`}
          </button>
          <p className="fine">By booking, you agree to our <a>Terms of Service</a> and the vendor's cancellation policy.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;
