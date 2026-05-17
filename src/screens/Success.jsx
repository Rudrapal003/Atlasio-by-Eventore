import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../App';

const Success = () => {
  const { state } = useApp();
  const lastBooking = state.bookings?.[state.bookings.length - 1];
  const deposit = lastBooking?.deposit ?? 0;

  return (
    <div className="screen-body" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div className="success-ico" style={{ marginBottom: 24 }}>
        <CheckCircle size={64} strokeWidth={1.5} />
      </div>
      <h2 className="success-h">Booking Confirmed!</h2>
      <p className="success-sub">
        Your deposit of <b>${deposit.toLocaleString()}</b> has been received. {state.selectedVendor?.name} has been notified and will reach out shortly.
      </p>
      
      <div className="success-card" style={{ width: '100%', textAlign: 'left', marginTop: 24 }}>
        <div className="row head">
          <div>
            <h6 style={{ margin: 0 }}>{state.selectedVendor?.name}</h6>
            <small>{state.selectedPackage?.name}</small>
          </div>
        </div>
        <div className="row">
          <span>Date</span>
          <b>{state.event?.date ? new Date(state.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 15, 2026'}</b>
        </div>
        <div className="row">
          <span>Guests</span>
          <b>{state.guests}</b>
        </div>
      </div>

      <div className="success-cta" style={{ position: 'relative', marginTop: 'auto', width: '100%', padding: 0 }}>
        <Link to="/my-events" style={{ width: '100%' }}>
          <button className="primary" style={{ width: '100%' }}>View My Events</button>
        </Link>
        <Link to="/discovery" style={{ width: '100%', marginTop: 12 }}>
          <button className="ghost" style={{ width: '100%' }}>Back to Discovery</button>
        </Link>
      </div>
    </div>
  );
};

export default Success;
