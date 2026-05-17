import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Upload, Check } from 'lucide-react';
import { useApp } from '../App';

// PRD §11.3 — in-app dispute submission with structured options + evidence upload.
// Customer files, vendor gets 7 days to respond, Evently support decides.
const REASONS = [
  { id: 'no-show',       label: 'Vendor no-show',                 hint: "The vendor didn't show up for the event." },
  { id: 'quality',       label: 'Quality below description',       hint: 'What was delivered differs materially from what was promised.' },
  { id: 'double-charge', label: 'Double-charged',                  hint: 'I was charged twice for the same booking.' },
  { id: 'late',          label: 'Significantly late',              hint: 'Vendor arrived too late for the event to use them as planned.' },
  { id: 'damage',        label: 'Property damage',                 hint: 'Vendor damaged property at the event venue.' },
  { id: 'other',         label: 'Other',                           hint: "Something else that doesn't fit the categories above." }
];

const DisputeFlow = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState('');
  const [files, setFiles] = useState([]);

  const booking = state.bookings?.[state.bookings.length - 1] || {
    vendorName: state.selectedVendor?.name || 'Tandoor & Co',
    eventDate: state.event?.date || 'Aug 15, 2026'
  };

  const submit = () => setStep(3);

  if (step === 3) {
    return (
      <div className="screen-body" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Check size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '0 0 8px' }}>Dispute filed</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}>
          We've notified {booking.vendorName || state.selectedVendor?.name}. They have <b>7 days</b> to respond.
          Evently Support will review and decide within 14 days.
        </p>
        <div style={{ width: '100%', background: '#F8FAFC', border: '1px solid var(--line)', borderRadius: 12, padding: 16, margin: '24px 0', fontSize: 13, color: 'var(--muted)', textAlign: 'left' }}>
          <b style={{ color: 'var(--ink)' }}>Case #</b> EV-{Date.now().toString().slice(-6)}<br/>
          <b style={{ color: 'var(--ink)' }}>Booking</b> {booking.vendorName || state.selectedVendor?.name}<br/>
          <b style={{ color: 'var(--ink)' }}>Reason</b> {REASONS.find(r => r.id === reason)?.label}
        </div>
        <button
          onClick={() => navigate('/my-events')}
          style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Back to My Events
        </button>
      </div>
    );
  }

  return (
    <div className="screen-body">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <h6 style={{ margin: 0, fontSize: 16, flex: 1 }}>Open a dispute</h6>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Step {step}/2</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ padding: 12, background: '#FEF3F2', border: '1px solid #FECDCA', borderRadius: 12, display: 'flex', gap: 10, marginBottom: 20 }}>
          <ShieldAlert size={18} color="#B42318" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: '#7A271A', lineHeight: 1.5 }}>
            Most issues resolve through direct messaging first. Dispute only if you've already tried to resolve and the vendor isn't responding.
          </div>
        </div>

        <div style={{ padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Filing dispute about</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{booking.vendorName || state.selectedVendor?.name || 'Tandoor & Co'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{booking.eventDate || state.event?.date || 'Aug 15, 2026'}</div>
        </div>

        {step === 1 && (
          <>
            <h3 style={{ fontSize: 15, margin: '0 0 12px' }}>What happened?</h3>
            {REASONS.map(r => (
              <div key={r.id} onClick={() => setReason(r.id)} style={{
                padding: 14, marginBottom: 8, borderRadius: 12,
                border: `2px solid ${reason === r.id ? 'var(--primary)' : 'var(--line)'}`,
                background: reason === r.id ? 'var(--primary-soft)' : 'white',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 14, color: 'var(--ink)' }}>{r.label}</b>
                  {reason === r.id && <Check size={16} color="var(--primary)" />}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>{r.hint}</p>
              </div>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ fontSize: 15, margin: '0 0 4px' }}>Describe what happened</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>Be specific. Evently Support and the vendor will both see this.</p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="On the day of the event…"
              rows={6}
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
            />

            <h3 style={{ fontSize: 15, margin: '24px 0 8px' }}>Evidence (optional)</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>Photos, screenshots, or PDFs. Up to 10MB total.</p>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: 16, borderRadius: 12, border: '2px dashed var(--line)',
              background: '#FBFBFB', cursor: 'pointer'
            }}>
              <Upload size={18} color="var(--muted)" />
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                {files.length ? `${files.length} file${files.length === 1 ? '' : 's'} attached` : 'Tap to attach photos or PDFs'}
              </span>
              <input
                type="file" multiple style={{ display: 'none' }}
                accept="image/*,application/pdf"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)', background: 'white' }}>
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!reason}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, fontSize: 15, cursor: reason ? 'pointer' : 'not-allowed', opacity: reason ? 1 : 0.5 }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={details.trim().length < 10}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, fontSize: 15, cursor: details.trim().length >= 10 ? 'pointer' : 'not-allowed', opacity: details.trim().length >= 10 ? 1 : 0.5 }}
          >
            Submit dispute
          </button>
        )}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', margin: '8px 0 0' }}>
          Evently's decision is binding for in-app booked events.
        </p>
      </div>
    </div>
  );
};

export default DisputeFlow;
