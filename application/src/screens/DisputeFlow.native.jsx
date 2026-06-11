import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';

export default function DisputeFlowNative({ navigation }) {
  const [reason, setReason] = useState('');

  const submitDispute = () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please describe the issue.');
      return;
    }
    Alert.alert('Dispute Submitted', 'Our mediation team will review your case and pause the escrow payout.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1c1c1e" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningBox}>
          <AlertTriangle color="#ff9500" size={24} />
          <Text style={styles.warningText}>
            Filing a dispute will instantly freeze the vendor's escrow payout. Use this only for severe contract breaches (e.g., no-shows).
          </Text>
        </View>

        <Text style={styles.label}>What went wrong?</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Describe the issue in detail..."
          value={reason}
          onChangeText={setReason}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={submitDispute}>
          <Text style={styles.submitText}>Submit Dispute to Mediation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1c1c1e' },
  content: { flex: 1, padding: 20 },
  warningBox: { flexDirection: 'row', backgroundColor: '#fff4e5', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  warningText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#cc7700', lineHeight: 18 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#1c1c1e', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 15, height: 150, fontSize: 15, borderWidth: 1, borderColor: '#e5e5ea', marginBottom: 20 },
  submitButton: { backgroundColor: '#ff3b30', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
