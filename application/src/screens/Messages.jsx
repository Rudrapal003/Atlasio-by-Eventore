import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

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

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!state.user?.id) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${state.user.id},recipient_id.eq.${state.user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by thread (vendor/planner pair)
        const threadMap = {};
        (data || []).forEach(msg => {
          const threadKey = [msg.sender_id, msg.recipient_id].sort().join('_');
          if (!threadMap[threadKey]) {
            threadMap[threadKey] = {
              id: threadKey,
              vendorId: msg.sender_id === state.user.id ? msg.recipient_id : msg.sender_id,
              name: msg.vendor_name || msg.sender_name || 'Vendor',
              img: msg.vendor_img || null,
              lastMsg: msg.body || '',
              time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              unread: msg.read === false && msg.recipient_id === state.user.id ? 1 : 0,
              confirmed: msg.booking_confirmed || false,
              messages: []
            };
          }
          threadMap[threadKey].messages.push(msg);
        });
        setChats(Object.values(threadMap));
      } catch (err) {
        console.error('Error fetching messages:', err);
        // Fall back to inquiries-based threads if messages table doesn't exist yet
        if (state.inquiries && state.inquiries.length > 0) {
          const inquiryChats = state.inquiries.map(inq => ({
            id: inq.id || inq.vendorId,
            vendorId: inq.vendorId,
            name: inq.vendorName || 'Vendor',
            img: inq.vendorImg || null,
            lastMsg: inq.message || 'Inquiry sent',
            time: inq.time || 'Now',
            unread: 0,
            confirmed: inq.confirmed || false,
            messages: [{ from: 'me', body: inq.message || 'Inquiry sent' }]
          }));
          setChats(inquiryChats);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Realtime subscription for new messages
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${state.user.id}`
      }, () => {
        fetchChats(); // Refresh on new message
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [state.user?.id]);

  if (open) {
    const chat = chats.find(c => c.id === open);
    if (chat) return <Thread chat={chat} onBack={() => setOpen(null)} userId={state.user?.id} />;
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
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
            <Loader2 className="animate-spin" color="var(--primary)" size={32} />
          </div>
        ) : chats.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <ShieldCheck size={40} color="var(--primary)" />
            </div>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>Your Inbox is Quiet</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px', maxWidth: 280 }}>
              Send an inquiry to a vendor to start a conversation. Your contact info stays hidden until you book!
            </p>
            <Link to="/discovery" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ padding: '12px 24px' }}>Find Vendors</button>
            </Link>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setOpen(chat.id)}
              style={{ display: 'flex', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
            >
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: chat.img ? `url(${chat.img}) center/cover` : 'var(--primary-soft)',
                backgroundImage: chat.img ? `url(${chat.img})` : 'none',
                backgroundSize: 'cover',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: 'var(--primary)'
              }}>
                {!chat.img && (chat.name?.[0] || 'V')}
              </div>
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
          ))
        )}
      </div>
    </div>
  );
};

// Single-thread view — fetches real messages and masks contact info
const Thread = ({ chat, onBack, userId }) => {
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState(
    (chat.messages || []).map(m => ({
      from: m.sender_id === userId ? 'me' : 'vendor',
      body: m.body || m.message || ''
    }))
  );

  const send = async () => {
    if (!draft.trim()) return;
    const newMsg = { from: 'me', body: draft };
    setMsgs(m => [...m, newMsg]);
    setDraft('');

    // Persist to Supabase if real user
    if (userId && chat.vendorId) {
      await supabase.from('messages').insert({
        sender_id: userId,
        recipient_id: chat.vendorId,
        body: draft,
        booking_confirmed: chat.confirmed || false
      });
    }
  };

  return (
    <div className="screen-body">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>←</button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: chat.img ? `url(${chat.img}) center/cover` : 'var(--primary-soft)',
          backgroundImage: chat.img ? `url(${chat.img})` : 'none',
          backgroundSize: 'cover',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'var(--primary)'
        }}>
          {!chat.img && (chat.name?.[0] || 'V')}
        </div>
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
              Phone numbers, emails, and links are hidden in messages. Confirm a booking to unlock direct contact and Eventore's booking protection.
            </p>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 40 }}>
            No messages yet. Send one below!
          </div>
        ) : msgs.map((m, i) => (
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
