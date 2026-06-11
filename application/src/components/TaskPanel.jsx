import React, { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle, Paperclip, MessageSquare, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const TaskPanel = ({ task, onClose, onUpdate }) => {
  const [comment, setComment] = useState('');

  if (!task) return null;

  const handleStatusChange = async (newStatus) => {
    // In a real app we update Supabase here:
    // await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    onUpdate({ ...task, status: newStatus });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '24px', minHeight: '60%' }}>
        <div className="flex-row justify-between align-center mb-16">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Task Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0 }}><X size={24} /></button>
        </div>
        
        <div className="flex-row justify-between align-center mb-16">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', flex: 1 }}>{task.title}</h2>
          <select 
            value={task.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
          >
            <option value="not started">Not Started</option>
            <option value="in progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>

        {task.description && <p style={{ color: '#666', marginBottom: '16px' }}>{task.description}</p>}

        <div className="flex-row mb-24" style={{ gap: '16px' }}>
          <div className="flex-row align-center" style={{ gap: '6px', color: '#555' }}>
            <Calendar size={16} />
            <span style={{ fontSize: '14px' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
          </div>
          {task.vendor_id && (
            <div className="flex-row align-center" style={{ gap: '6px', color: '#555' }}>
              <User size={16} />
              <span style={{ fontSize: '14px' }}>Vendor Assigned</span>
            </div>
          )}
        </div>

        <div className="mb-24">
          <div className="flex-row align-center mb-8" style={{ gap: '8px' }}>
            <Paperclip size={16} />
            <h4 style={{ fontWeight: 'bold' }}>Attachments</h4>
          </div>
          <button className="btn" style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#f0f0f0', color: '#333' }}>Upload File</button>
        </div>

        <div>
          <div className="flex-row align-center mb-8" style={{ gap: '8px' }}>
            <MessageSquare size={16} />
            <h4 style={{ fontWeight: 'bold' }}>Comments</h4>
          </div>
          <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center' }}>No comments yet.</p>
          </div>
          <div className="flex-row" style={{ gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button className="btn" style={{ padding: '10px 16px', borderRadius: '8px' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPanel;
