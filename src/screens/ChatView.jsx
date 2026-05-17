import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon, Smile, MoreVertical, Loader2 } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';

const ChatView = () => {
  const { id: inquiryId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  const themeClass = state.userType === 'creator' ? 'theme-creator' : 'theme-planner';
  const currentUserId = state.user?.id;

  useEffect(() => {
    if (!inquiryId || !currentUserId) return;

    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching messages:', error);
      else setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    // 2. Subscribe to new messages
    const subscription = supabase
      .channel(`inquiry:${inquiryId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `inquiry_id=eq.${inquiryId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [inquiryId, currentUserId]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentUserId) return;
    
    const textToSend = inputText;
    setInputText('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            inquiry_id: inquiryId,
            sender_id: currentUserId,
            content: textToSend
          }
        ]);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`screen-body ${themeClass}`} style={{ background: '#F8FAFC' }}>
      {/* Chat Header */}
      <div style={{ 
        padding: '16px 20px', 
        background: 'white', 
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0 }}>
          <ArrowLeft size={24} color="var(--ink)" />
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{state.userType === 'creator' ? 'P' : 'T'}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{state.userType === 'creator' ? 'Priya Patel' : 'Tandoor & Co'}</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#10B981' }}>Online</p>
        </div>
        <MoreVertical size={20} color="var(--muted)" />
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', background: '#EEF2F6', padding: '4px 12px', borderRadius: '12px' }}>Today</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>No messages yet. Say hi!</div>
        ) : messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div 
              key={msg.id} 
              style={{ 
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: isMine ? '18px 18px 0 18px' : '18px 18px 18px 0',
                background: isMine ? 'var(--primary)' : 'white',
                color: isMine ? 'white' : 'var(--ink)',
                fontSize: '14px',
                boxShadow: isMine ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                lineHeight: 1.5
              }}>
                {msg.content}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '16px 20px 32px', 
   