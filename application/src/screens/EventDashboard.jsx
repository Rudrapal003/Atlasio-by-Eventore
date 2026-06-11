import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Search, Filter, Users, Mail } from 'lucide-react';
import { useApp } from '../AppContext';
import TaskPanel from '../components/TaskPanel';

const EventDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('tasks'); // 'overview', 'tasks', 'vendors'
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch from global state instead of using hardcoded mock data
  const event = state.event?.title ? state.event : { title: 'Untitled Event', date: '', budget: 0 };
  
  const [tasks, setTasks] = useState([]);
  const [vendors] = useState([]);
  const [guests] = useState([]);

  // "What's blocking?" logic
  const blockers = tasks.filter(t => t.status === 'blocked' || (t.priority === 'high' && new Date(t.due_date) < new Date()));
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100) || 0;

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  return (
    <div className="bg-gray-50 pb-24" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="p-16 bg-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="flex-row align-center mb-16">
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', marginRight: '12px', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{event.title || 'Event Dashboard'}</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex-row justify-between mb-8" style={{ fontSize: '14px', color: '#4b5563' }}>
            <span>Overall Progress</span>
            <span style={{ fontWeight: 'bold' }}>{progressPercent}%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#10b981', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-row" style={{ borderBottom: '1px solid #e5e7eb' }}>
          {['overview', 'tasks', 'vendors', 'guests'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                flex: 1, 
                padding: '12px 0', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === tab ? '2px solid #b91c1c' : '2px solid transparent',
                color: activeTab === tab ? '#b91c1c' : '#6b7280',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-16">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="card mb-16 p-16" style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>Event Details</h3>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong style={{ color: '#111' }}>Date:</strong> {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong style={{ color: '#111' }}>Budget:</strong> ${event.budget?.toLocaleString()}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong style={{ color: '#111' }}>Guests:</strong> {event.guests}</p>
            </div>
            
            {blockers.length > 0 && (
              <div className="card p-16" style={{ backgroundColor: '#fef2f2', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                <h3 className="flex-row align-center" style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '8px', fontSize: '16px' }}>
                  <AlertCircle size={18} style={{ marginRight: '8px' }} /> Action Required
                </h3>
                <p style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '12px' }}>These items are blocking progress:</p>
                {blockers.map(b => (
                  <div key={b.id} className="flex-row justify-between mb-8 p-12" style={{ backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setSelectedTask(b)}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{b.title}</span>
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>Due {new Date(b.due_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-tab">
            <div className="flex-row justify-between align-center mb-16">
              <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>All Tasks</h3>
              <div className="flex-row" style={{ gap: '8px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Filter size={18} color="#6b7280" /></button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Search size={18} color="#6b7280" /></button>
              </div>
            </div>

            {/* Task List */}
            <div className="task-list">
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={32} color="#9ca3af" />
                  </div>
                  <h4 style={{ color: '#111827', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Tasks Yet</h4>
                  <p style={{ fontSize: 14, marginBottom: 20 }}>Break down your planning into actionable steps.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex-row align-center mb-12 p-16" 
                    onClick={() => setSelectedTask(task)}
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      borderLeft: task.status === 'blocked' ? '4px solid #ef4444' : task.status === 'done' ? '4px solid #10b981' : '4px solid transparent' 
                    }}
                  >
                    <div style={{ marginRight: '16px' }}>
                      {task.status === 'done' ? <CheckCircle size={24} color="#10b981" /> : 
                       task.status === 'blocked' ? <AlertCircle size={24} color="#ef4444" /> : 
                       <div style={{ width: '22px', height: '22px', borderRadius: '11px', border: '2px solid #d1d5db' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        textDecoration: task.status === 'done' ? 'line-through' : 'none', 
                        color: task.status === 'done' ? '#9ca3af' : '#111827',
                        margin: '0 0 4px 0',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}>
                        {task.title}
                      </h4>
                      <div className="flex-row align-center" style={{ gap: '12px' }}>
                        <span className="flex-row align-center" style={{ fontSize: '12px', color: '#6b7280' }}>
                          <Clock size={12} style={{ marginRight: '4px' }} /> {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        {task.vendor_id && (
                          <span style={{ fontSize: '11px', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#4b5563' }}>
                            {vendors.find(v => v.id === task.vendor_id)?.name || 'Vendor'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="btn w-100 mt-16" style={{ backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#374151' }}>Add New Task</button>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="vendors-tab">
            <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>Vendor Team</h3>
            {vendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={32} color="#9ca3af" />
                </div>
                <h4 style={{ color: '#111827', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Vendors Booked</h4>
                <p style={{ fontSize: 14, marginBottom: 20 }}>You haven't hired any professionals for this event yet.</p>
                <button className="btn btn-primary" onClick={() => navigate('/discovery')} style={{ width: '100%', justifyContent: 'center' }}>Search Directory</button>
              </div>
            ) : (
              vendors.map(vendor => (
                <div key={vendor.id} className="mb-12 p-16" style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div className="flex-row justify-between align-center mb-8">
                    <div>
                      <h4 style={{ fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '15px' }}>{vendor.name}</h4>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{vendor.category}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{vendor.score}%</span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>Tasks Done</span>
                    </div>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ height: '100%', width: `${vendor.score}%`, backgroundColor: vendor.score === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                  <button 
                    className="btn w-100" 
                    style={{ padding: '8px', fontSize: '13px', backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#374151' }}
                    onClick={() => { setActiveTab('tasks'); /* Would filter by vendor in real app */ }}
                  >
                    View Tasks
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'guests' && (
          <div className="guests-tab">
            <div className="flex-row justify-between align-center mb-16">
              <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>Guest List</h3>
              <button className="btn outline btn-small" style={{ padding: '6px 12px', fontSize: '12px' }}>Add Guest</button>
            </div>
            
            <div className="flex-row mb-16" style={{ gap: '12px' }}>
              <div className="card flex-1 p-12" style={{ backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{guests.filter(g => g.rsvp_status === 'attending').length}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Attending</span>
              </div>
              <div className="card flex-1 p-12" style={{ backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{guests.filter(g => g.rsvp_status === 'pending').length}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Pending</span>
              </div>
              <div className="card flex-1 p-12" style={{ backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{guests.filter(g => g.rsvp_status === 'declined').length}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Declined</span>
              </div>
            </div>

            <div className="guest-list">
              {guests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={32} color="#9ca3af" />
                  </div>
                  <h4 style={{ color: '#111827', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Empty Guest List</h4>
                  <p style={{ fontSize: 14, marginBottom: 0 }}>Start adding guests to send RSVPs.</p>
                </div>
              ) : (
                guests.map(guest => (
                  <div key={guest.id} className="card mb-12 p-16" style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="flex-row justify-between align-center">
                      <div>
                        <h4 style={{ fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '15px' }}>{guest.name}</h4>
                        <span className="flex-row align-center" style={{ fontSize: '12px', color: '#6b7280' }}>
                          <Mail size={12} style={{ marginRight: '4px' }} /> {guest.email}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: guest.rsvp_status === 'attending' ? '#d1fae5' : guest.rsvp_status === 'declined' ? '#fee2e2' : '#fef3c7',
                        color: guest.rsvp_status === 'attending' ? '#047857' : guest.rsvp_status === 'declined' ? '#b91c1c' : '#b45309'
                      }}>
                        {guest.rsvp_status}
                      </span>
                    </div>
                    {(guest.plus_one > 0 || guest.dietary_restrictions) && (
                      <div className="flex-row" style={{ gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                        {guest.plus_one > 0 && (
                          <span className="flex-row align-center" style={{ fontSize: '12px', color: '#4b5563' }}>
                            <Users size={12} style={{ marginRight: '4px' }} /> +{guest.plus_one} Guest
                          </span>
                        )}
                        {guest.dietary_restrictions && (
                          <span style={{ fontSize: '12px', color: '#b91c1c' }}>
                            <strong>Dietary:</strong> {guest.dietary_restrictions}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <button className="btn w-100 mt-8" style={{ backgroundColor: '#eef2ff', color: '#4f46e5', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
              Share RSVP Link
            </button>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskPanel 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default EventDashboard;
