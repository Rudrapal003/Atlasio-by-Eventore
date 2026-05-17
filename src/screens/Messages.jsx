import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../App';

// Anti-circumvention masking — PRD §10 layer 2.
// Auto-hide phone numbers, emails, and common social handles in any message
// where the booking isn't confirmed yet. The vendor's external profile links
// are intentionally exempt: we *want* customers to verify trust signals on
// Instagram/Google. Only direct-contact handles get masked.
const PHONE_RE  = /(\+?\d[\d\s().-]{8,}\d)/g;
const EMAIL_RE  = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const HANDLE_RE = /(@[a-zA-Z0-9._]{3,})/g;
const URL_RE    = /\b((?:https?:\/\/|www\.)\S+)/g;

const MASK = '••• hidden until booking •••';

const maskBody = (text, isConfirmed) => {
  if (isConfirmed) return text;
  return text
    .replace(EMAIL_RE,  MASK)
    .replace(PHONE_RE,  MASK)
    .replace(URL_RE,    MASK)
    .replace(HANDLE_RE, MASK);
};

const Messages = () => {
  const { state } = useApp();
  const themeClass = state.userType === 'creator' ? 'theme-creator' : 'theme-planner';

  // In a real app, `confirmed` is derived from the booking on this thread.
  const chats = [
    { id: 1, name: 'Tandoor & Co',  lastMsg: 'Hi! For 250 guests our package is $85/pp. Call me at 416-555-0142 to lock the date.', time: '2m',         unread: 2, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&h=100&fit=crop', confirmed: false },
    { id: 2, name: 'Crystal Palace', lastMsg: 'Booking confirmed — venue ready by 10am. Day-of contact: ops@crystalpalace.ca',         time: '1h',         unread: 1, img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&h=100&fit=crop', confirmed: true },
    { id: 3, name: 'Bloom & Bough',  lastMsg: 'Attached are 3 mood-board options — let me know which you prefer.',                       time: 'Yesterday',  unread: 0, img: 'https://images.unsplash.com/photo-1561128290-006dc4827214?w=100&h=100&fit=crop', confirmed: false }
  ];

  const [open, setOpen] = useState(null);

  if (open) {
    const chat = chats.find(c => c.id === open);
    return <Thread chat={chat} onBack={() => setOpen(null)} />;
  }

  return (
    <div className={`screen-body ${themeClass}`}>
      <div style={{ padding: '24px 20px 10px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', margin: 0 }}>Messages</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={12} /> Contact info is hidden until your booking is confirmed.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {chats.map(chat => (
          <Link key={chat.id} to={`/chat/${chat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundImage: `url(${chat.img})`, backgroundSize: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h6 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {chat.name}
                    {chat.confirmed && <span title="Booking confirmed"><ShieldCheck size={12} color="var(--primary)" /></span>}
                  </h6>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{chat.time}</span>
                </div>
                <p style={{ fontSize: '13px', color: chat.unread ? 'var(--ink)' : 'var(--muted)', fontWeight: chat.unread ? 500 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {maskBody(chat.lastMsg, chat.confirmed)}
                </p>
              </div>
              {chat.unread > 0 && (
                <div style={{ width: '18px', height: '18px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                  {chat.unread}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Single-thread view — also masks contact info, and proves the masking shows
// where the hidden text actually lives so customers see the value exchange.
const Thread = ({ chat, onBack }) => {
  const [draft, setDraft] = useState('');
  const seed = [
    { from: 'vendor', body: 'Hi! Thanks for the inquiry. For 250 guests our package is $85/pp.' },
    { from: 'vendor', body: 'You can reach me directly at 416-555-0142 or aisha@tandorco.com to lock the date.' },
    { from: 'me',     body: 'Sounds great — what dates are still open in August?' },
    { from: 'vendor', body: chat.lastMsg }
  ];
  const [msgs, setMsgs] = useState(seed);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs(m => [...m, { from: 'me', body: draft }]);
    setDraft('');
  };

  return (
    <div className="screen-body">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundImage: `url(${chat.img})`, backgroundSize: 'cover' }} />
        <div style={{ flex: 1 }}>
          <h6 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{chat.name}</h6>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
            {chat.confirmed ? 'Booking confirmed' : 'Inquiry · contact info masked'}
          </p>
        </div>
      </div>

      {!chat.confirmed && (
        <div style={{ margin: '12px 16px', padding: 12, borderRadius: 12, background: '#FFF7ED', border: '1px solid #FED7AA', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Lock size={16} color="#9A3412" style={{ marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, color: '#9A3412', fontWeight: 600 }}>Contact info will be shared after booking.</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9A3412' }}>
              Phone numbers, emails, and links are hidden in messages. Confirm a booking to unlock direct contact and Evently's booking protection.
            </p>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
            maxWidth: '75%',
            padding: '10px 14px',
            borderRadius: 16,
            background: m.from === 'me' ? 'var(--primary)' : '#F1F5F9',
            color: m.from === 'me' ? 'white' : 'var(--ink)',
            fontSize: 14, lineHeight: 1.4
          }}>
            {maskBody(m.body, chat.confirmed)}
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 999, border: '1px solid var(--line)', fontSize: 14 }}
        />
        <button onClick={send} style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
