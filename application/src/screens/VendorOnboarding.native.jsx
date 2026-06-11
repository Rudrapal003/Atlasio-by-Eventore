import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, Circle, ChevronRight, Camera, X } from 'lucide-react-native';

const ONBOARD_TASK_TEMPLATES = [
  {
    id: "tpl_caterer",
    title: "Caterer",
    default_tasks: [
      { id: "t1", title: "Create profile", estimated_time: "30 sec" },
      { id: "t2", title: "Add sample menu items", estimated_time: "3 min" },
      { id: "t3", title: "Upload food photos", estimated_time: "1 min" },
      { id: "t4", title: "Set availability and blackout dates", estimated_time: "1 min" },
      { id: "t5", title: "Upload licenses/insurance", estimated_time: "2 min" }
    ]
  },
  {
    id: "tpl_photographer",
    title: "Photographer",
    default_tasks: [
      { id: "t1", title: "Create profile", estimated_time: "30 sec" },
      { id: "t2", title: "Add packages & pricing", estimated_time: "2 min" },
      { id: "t3", title: "Upload portfolio galleries", estimated_time: "3 min" },
      { id: "t4", title: "Set availability", estimated_time: "1 min" },
      { id: "t5", title: "Upload insurance and contract terms", estimated_time: "2 min" }
    ]
  },
  {
    id: "tpl_venue",
    title: "Venue",
    default_tasks: [
      { id: "t1", title: "Add venue profile & capacity", estimated_time: "1 min" },
      { id: "t2", title: "Add room/package types", estimated_time: "2 min" },
      { id: "t3", title: "Upload floor plans and photos", estimated_time: "2 min" },
      { id: "t4", title: "Set availability calendar", estimated_time: "1 min" },
      { id: "t5", title: "Add deposit and cancellation terms", estimated_time: "1 min" }
    ]
  }
];

const VendorOnboarding = () => {
  const navigation = useNavigation();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    // Initialize tasks with pending status
    setTasks(template.default_tasks.map(t => ({ ...t, status: 'pending' })));
  };

  const handleCompleteTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
    setActiveTask(null);
  };

  const handleBulkComplete = () => {
    setTasks(tasks.map(t => ({ ...t, status: 'done' })));
  };

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const handlePublish = () => {
    // In a real app, we would save to Supabase here
    navigation.replace('VendorDashboard'); // Replace with actual vendor dashboard route if it exists, or just go back
  };

  if (!selectedTemplate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>What kind of vendor are you?</Text>
          <Text style={styles.subtitle}>Select your category to get a customized setup checklist.</Text>
        </View>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {ONBOARD_TASK_TEMPLATES.map(tpl => (
            <TouchableOpacity 
              key={tpl.id} 
              style={styles.templateCard}
              onPress={() => handleSelectTemplate(tpl)}
            >
              <Text style={styles.templateTitle}>{tpl.title}</Text>
              <ChevronRight color="#94A3B8" size={20} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Get Ready for Bookings</Text>
        <Text style={styles.subtitle}>Complete these quick steps to go live on Eventore.</Text>
        
        {/* Progress KPI */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Profile completeness</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {tasks.map((task) => {
          const isDone = task.status === 'done';
          return (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskCard, isDone && styles.taskCardDone]}
              onPress={() => !isDone && setActiveTask(task)}
              disabled={isDone}
            >
              <View style={styles.taskIcon}>
                {isDone ? <CheckCircle color="#10B981" size={24} /> : <Circle color="#94A3B8" size={24} />}
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
                {!isDone && <Text style={styles.taskTime}>{task.estimated_time}</Text>}
              </View>
              {!isDone && <ChevronRight color="#94A3B8" size={20} />}
            </TouchableOpacity>
          );
        })}

        {progress < 100 && (
          <Text style={styles.bulkButtonText} onPress={handleBulkComplete}>Mock: Complete All with AI</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.publishButton, progress < 100 && styles.publishButtonIncomplete]}
          onPress={handlePublish}
        >
          <Text style={styles.publishButtonText}>
            {progress === 100 ? 'Go Live & Accept Bookings' : 'Publish Incomplete (Hidden from Search)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Micro-form Modal */}
      <Modal visible={!!activeTask} animationType="slide" presentationStyle="pageSheet" transparent={true}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeTask?.title}</Text>
              <TouchableOpacity onPress={() => setActiveTask(null)}>
                <X color="#0F172A" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>This is a rapid input form.</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Enter details here..." 
                autoFocus 
              />
              <TouchableOpacity style={styles.photoUploadButton}>
                <Camera color="#64748B" size={24} />
                <Text style={styles.photoUploadText}>Tap to upload photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveTaskButton} onPress={() => handleCompleteTask(activeTask.id)}>
                <Text style={styles.saveTaskButtonText}>Save & Mark Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', lineHeight: 22 },
  
  progressContainer: { marginTop: 24, backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: '#E11D48' },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#E11D48' },

  content: { flex: 1, paddingHorizontal: 24 },
  
  templateCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  templateTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },

  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  taskCardDone: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' },
  taskIcon: { marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  taskTitleDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  taskTime: { fontSize: 13, color: '#64748B' },

  bulkButton: { padding: 16, alignItems: 'center', marginTop: 12 },
  bulkButtonText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },

  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: 'white' },
  publishButton: { backgroundColor: '#E11D48', padding: 16, borderRadius: 12, alignItems: 'center' },
  publishButtonIncomplete: { backgroundColor: '#94A3B8' },
  publishButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  modalBody: { flex: 1 },
  modalLabel: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
  photoUploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  photoUploadText: { marginLeft: 8, color: '#64748B', fontWeight: '500' },
  modalFooter: { paddingTop: 20 },
  saveTaskButton: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveTaskButtonText: { color: 'white', fontWeight: '600', fontSize: 16 }
});

export default VendorOnboarding;
