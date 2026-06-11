import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Star, ArrowLeft } from 'lucide-react-native';

export default function ReviewPromptNative({ navigation }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const submitReview = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a star rating.');
      return;
    }
    Alert.alert('Review Submitted', 'Thank you! The vendor escrow has now been released.', [
      { text: 'Back to Dashboard', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1c1c1e" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Vendor</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>How was Tandoor & Co?</Text>
        <Text style={styles.subtitle}>Your feedback helps other hosts book with confidence.</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.star}>
              <Star
                color={star <= rating ? '#ffcc00' : '#e5e5ea'}
                fill={star <= rating ? '#ffcc00' : 'transparent'}
                size={40}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Leave a written review (optional)..."
          value={review}
          onChangeText={setReview}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
          <Text style={styles.submitText}>Submit Review & Release Payout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.goBack()}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1c1c1e' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1e', marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#8e8e93', textAlign: 'center', marginBottom: 30 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  star: { marginHorizontal: 5 },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 8, padding: 15, height: 120, fontSize: 15, borderWidth: 1, borderColor: '#e5e5ea', marginBottom: 30 },
  submitButton: { width: '100%', backgroundColor: '#007aff', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  skipButton: { padding: 10 },
  skipText: { color: '#8e8e93', fontSize: 14 }
});
