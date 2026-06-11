import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Clock, MapPin, CheckCircle, Circle, ArrowLeft } from 'lucide-react-native';

export default function DayOfTimelineNative({ navigation }) {
  const timelineEvents = [
    { time: '08:00 AM', title: 'Venue Access & Setup', location: 'Main Hall', status: 'completed' },
    { time: '10:00 AM', title: 'Florist Arrival', location: 'Entrance', status: 'completed' },
    { time: '12:00 PM', title: 'Caterer Kitchen Prep', location: 'Kitchen', status: 'in-progress' },
    { time: '03:00 PM', title: 'Guest Arrival', location: 'Lobby', status: 'upcoming' },
    { time: '04:00 PM', title: 'Ceremony Starts', location: 'Main Hall', status: 'upcoming' },
    { time: '06:00 PM', title: 'Dinner Service', location: 'Banquet Room', status: 'upcoming' },
    { time: '11:00 PM', title: 'Event Concludes', location: 'All Areas', status: 'upcoming' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1c1c1e" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day-of Timeline</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Saturday, August 15th</Text>
        
        <View style={styles.timelineContainer}>
          {timelineEvents.map((event, index) => (
            <View key={index} style={styles.eventRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{event.time}</Text>
              </View>
              
              <View style={styles.lineColumn}>
                {event.status === 'completed' ? (
                  <CheckCircle color="#34c759" size={20} />
                ) : event.status === 'in-progress' ? (
                  <View style={styles.activeDot} />
                ) : (
                  <Circle color="#c7c7cc" size={20} />
                )}
                {index !== timelineEvents.length - 1 && (
                  <View style={[styles.line, event.status === 'completed' ? styles.lineCompleted : null]} />
                )}
              </View>
              
              <View style={styles.detailsColumn}>
                <Text style={[styles.eventTitle, event.status === 'upcoming' && styles.textMuted]}>
                  {event.title}
                </Text>
                <View style={styles.locationRow}>
                  <MapPin color="#8e8e93" size={14} />
                  <Text style={styles.locationText}>{event.location}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeColumn: {
    width: 70,
    alignItems: 'flex-end',
    paddingRight: 15,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
  },
  lineColumn: {
    width: 30,
    alignItems: 'center',
  },
  activeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007aff',
    borderWidth: 4,
    borderColor: '#e5f1ff',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e5ea',
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: '#34c759',
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: 15,
    paddingBottom: 25,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  textMuted: {
    color: '#8e8e93',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#8e8e93',
    marginLeft: 4,
  },
});
