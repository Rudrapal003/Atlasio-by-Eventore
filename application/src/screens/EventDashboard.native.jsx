import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../AppContext';
import { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Circle, XCircle, ChevronRight, MessageSquare, MapPin, Calendar, DollarSign, Users, X, Sparkles } from 'lucide-react-native';

// Mock Data
const INITIAL_VENDORS = [
  { id: 'v1', name: 'Lumina Catering', category: 'Catering', status: 'Booked', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop' },
  { id: 'v2', name: 'Petals & Co.', category: 'Decor', status: 'Pending', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=200&fit=crop' },
  { id: 'v3', name: 'DJ Pulse', category: 'Music', status: 'Shortlisted', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop' }
];

const INITIAL_TASKS = [
  { id: 1, title: 'Finalize menu tasting', vendor_id: 'v1', status: 'in_progress', due_date: '2026-06-15', notes: 'Need vegetarian options.' },
  { id: 2, title: 'Pay 50% deposit', vendor_id: 'v1', status: 'not_started', due_date: '2026-06-20', notes: '' },
  { id: 3, title: 'Approve floral moodboard', vendor_id: 'v2', status: 'blocked', due_date: '2026-07-01', notes: 'Waiting for color swatches.' },
  { id: 4, title: 'Sign contract', vendor_id: 'v3', status: 'done', due_date: '2026-05-10', notes: '' },
  { id: 5, title: 'Send invitations', vendor_id: null, status: 'not_started', due_date: '2026-07-15', notes: '' }
];

const EventDashboard = () => {
  const { state } = useApp();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Overview');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [mockVendors] = useState(INITIAL_VENDORS);
  
  // Combine mock vendors with actual booked vendors from state
  const vendors = useMemo(() => {
    const booked = (state.bookings || []).map(b => ({
      ...b.vendor,
      status: 'Booked'
    }));
    // Filter out mock vendors if they have the same ID as a booked vendor to avoid duplicates
    const uniqueMocks = mockVendors.filter(mv => !booked.some(bv => bv.id === mv.id));
    return [...booked, ...uniqueMocks];
  }, [state.bookings, mockVendors]);
  
  const [selectedVendorModal, setSelectedVendorModal] = useState(null);

  const event = state.event || { title: 'The Big Day', date: new Date().toISOString(), guests: 200, budget: 60000, location: 'Vancouver, BC' };
  const tabs = ['Overview', 'Tasks', 'Vendors'];

  // Helpers
  const vendorTasks = selectedVendorModal ? tasks.filter(t => t.vendor_id === selectedVendorModal.id) : [];
  
  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const autoGenerateTasks = () => {
    if (!selectedVendorModal) return;
    
    // Prevent duplicating AI tasks
    if (tasks.some(t => t.vendor_id === selectedVendorModal.id && t.notes === 'Auto-generated operational task')) {
      return;
    }

    const cat = (selectedVendorModal.category || '').toLowerCase();
    const newTasks = [];
    if (cat.includes('cater')) {
      newTasks.push('Finalize dietary requirements', 'Confirm final guest count', 'Confirm menu tasting');
    } else if (cat.includes('decor') || cat.includes('venue')) {
      newTasks.push('Approve final floorplan', 'Confirm setup arrival time');
    } else {
      newTasks.push('Confirm arrival time', 'Provide emergency contacts');
    }
    const added = newTasks.map((t, i) => ({
      id: Date.now() + i, title: t, vendor_id: selectedVendorModal.id, status: 'not_started', due_date: event.date, notes: 'Auto-generated operational task'
    }));
    setTasks(prev => [...prev, ...added]);
  };

  const StatusIcon = ({ status, size = 20 }) => {
    switch(status) {
      case 'done': return <CheckCircle2 color="#059669" size={size} />;
      case 'in_progress': return <Clock color="#D97706" size={size} />;
      case 'blocked': return <XCircle color="#DC2626" size={size} />;
      default: return <Circle color="#94A3B8" size={size} />;
    }
  };

  const renderOverview = () => {
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;
    
    // Calculate spent dynamically based on done tasks (mocking cost for demo)
    const spent = doneCount * 1200;

    return (
      <View style={{ gap: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}><Calendar size={18} color="#64748B" /><Text style={styles.summaryText}>{new Date(event.date).toLocaleDateString()}</Text></View>
            <View style={styles.summaryItem}><Users size={18} color="#64748B" /><Text style={styles.summaryText}>{event.guests} Guests</Text></View>
            <View style={styles.summaryItem}><MapPin size={18} color="#64748B" /><Text style={styles.summaryText}>{event.location}</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Budget Tracker</Text>
            <Text style={styles.cardLink}>View Details</Text>
          </View>
          <View style={styles.progressBarBg}><View style={[styles.progressBarFill, {width: `${Math.min((spent / (event.budget || 1)) * 100, 100)}%`, backgroundColor: '#3B82F6'}]} /></View>
          <View style={styles.rowBetween}>
            <Text style={styles.budgetUsed}>${spent.toLocaleString()} spent</Text>
            <Text style={styles.budgetTotal}>${event.budget.toLocaleString()} total</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Progress</Text>
          {tasks.length === 0 ? (
            <Text style={[styles.progressText, { marginTop: 0 }]}>No tasks found. Tap a vendor to generate actions!</Text>
          ) : (
            <>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, {width: `${progress}%`, backgroundColor: '#10B981'}]} /></View>
              <Text style={styles.progressText}>{doneCount} of {tasks.length} tasks completed</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderTasks = () => {
    return (
      <View style={{ gap: 12 }}>
        {tasks.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>No tasks added yet.</Text>
        )}
        {tasks.map(task => {
          const v = vendors.find(ven => ven.id === task.vendor_id);
          return (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => v && setSelectedVendorModal(v)}>
              <View style={styles.taskRow}>
                <StatusIcon status={task.status} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, task.status === 'done' && styles.taskDoneText]}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskDate}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</Text>
                    {v && <Text style={styles.taskVendorTag}> • {v.name}</Text>}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderVendors = () => {
    return (
      <View style={{ gap: 12 }}>
        {vendors.map(vendor => {
          const vTasks = tasks.filter(t => t.vendor_id === vendor.id);
          const vDone = vTasks.filter(t => t.status === 'done').length;
          
          return (
            <TouchableOpacity key={vendor.id} style={styles.vendorCard} onPress={() => setSelectedVendorModal(vendor)}>
              <Image source={{uri: vendor.image}} style={styles.vendorImage} />
              <View style={styles.vendorContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <View style={[styles.statusBadge, vendor.status === 'Booked' ? styles.statusBooked : styles.statusPending]}>
                    <Text style={[styles.statusText, vendor.status === 'Booked' && styles.statusBookedText]}>{vendor.status}</Text>
                  </View>
                </View>
                <Text style={styles.vendorCategory}>{vendor.category}</Text>
                <Text style={styles.vendorTasksProgress}>{vDone} of {vTasks.length} tasks done</Text>
              </View>
              <ChevronRight color="#CBD5E1" />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.addVendorBtn} onPress={() => navigation.navigate('VendorDiscovery')}>
          <Text style={styles.addVendorBtnText}>+ Find More Vendors</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{event.title}</Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Tasks' && renderTasks()}
        {activeTab === 'Vendors' && renderVendors()}
      </ScrollView>

      {/* VENDOR TASK PANEL MODAL */}
      <Modal visible={!!selectedVendorModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedVendorModal(null)}>
        {selectedVendorModal && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedVendorModal.name}</Text>
                <Text style={styles.modalSubtitle}>Task Panel & Collaboration</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedVendorModal(null)} style={styles.closeBtn}>
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Coming Soon', 'In-app messaging will be available in the next major update!')}>
                <MessageSquare size={16} color="#0F172A" />
                <Text style={styles.actionBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Coming Soon', 'Secure vendor payments will be available in the next major update!')}>
                <DollarSign size={16} color="#0F172A" />
                <Text style={styles.actionBtnText}>Payments</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]} onPress={autoGenerateTasks}>
                <Sparkles size={16} color="#166534" />
                <Text style={[styles.actionBtnText, { color: '#166534' }]}>Auto-Generate Actions</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.sectionHeader}>Assigned Tasks</Text>
              
              {vendorTasks.length === 0 ? (
                <Text style={styles.emptyText}>No tasks assigned yet.</Text>
              ) : (
                vendorTasks.map(task => (
                  <View key={task.id} style={styles.modalTaskCard}>
                    <Text style={styles.modalTaskTitle}>{task.title}</Text>
                    <Text style={styles.modalTaskDate}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</Text>
                    
                    {task.notes ? (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesText}>{task.notes}</Text>
                      </View>
                    ) : null}

                    <View style={styles.statusToggles}>
                      {['not_started', 'in_progress', 'blocked', 'done'].map(s => (
                        <TouchableOpacity 
                          key={s} 
                          style={[styles.statusToggle, task.status === s && styles.statusToggleActive(s)]}
                          onPress={() => updateTaskStatus(task.id, s)}
                        >
                          <Text style={[styles.statusToggleText, task.status === s && styles.statusToggleTextActive(s)]}>
                            {s.replace('_', ' ').toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#B91C1C' },
  tabText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  activeTabText: { color: '#B91C1C', fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardLink: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
  summaryGrid: { gap: 12 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryText: { fontSize: 15, color: '#334155', fontWeight: '500' },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  budgetUsed: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  budgetTotal: { fontSize: 13, color: '#64748B' },
  progressText: { fontSize: 13, color: '#64748B', marginTop: 4 },
  taskCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  taskDoneText: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskMeta: { flexDirection: 'row', marginTop: 4 },
  taskDate: { fontSize: 12, color: '#64748B' },
  taskVendorTag: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
  vendorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  vendorImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  vendorContent: { flex: 1 },
  vendorName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  vendorCategory: { fontSize: 13, color: '#64748B', marginTop: 2 },
  vendorTasksProgress: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: '#F1F5F9' },
  statusBooked: { backgroundColor: '#ECFDF5' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  statusBookedText: { color: '#059669' },
  addVendorBtn: { padding: 16, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', marginTop: 8 },
  addVendorBtnText: { color: '#64748B', fontWeight: '600' },
  
  // MODAL STYLES
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  modalActionsRow: { flexDirection: 'row', padding: 20, gap: 12, backgroundColor: 'white' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: '#F1F5F9', borderRadius: 8 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  emptyText: { color: '#64748B', fontStyle: 'italic' },
  modalTaskCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  modalTaskTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalTaskDate: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 12 },
  notesBox: { backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FEF3C7' },
  notesText: { fontSize: 13, color: '#92400E' },
  statusToggles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusToggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  statusToggleActive: (status) => {
    switch(status) {
      case 'done': return { backgroundColor: '#ECFDF5', borderColor: '#059669' };
      case 'in_progress': return { backgroundColor: '#FEF3C7', borderColor: '#D97706' };
      case 'blocked': return { backgroundColor: '#FEF2F2', borderColor: '#DC2626' };
      default: return { backgroundColor: '#F1F5F9', borderColor: '#94A3B8' };
    }
  },
  statusToggleText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  statusToggleTextActive: (status) => {
    switch(status) {
      case 'done': return { color: '#059669' };
      case 'in_progress': return { color: '#D97706' };
      case 'blocked': return { color: '#DC2626' };
      default: return { color: '#475569' };
    }
  }
});

export default EventDashboard;
