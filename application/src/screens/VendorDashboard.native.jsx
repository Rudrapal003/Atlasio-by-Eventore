import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Bell, TrendingUp, Calendar as CalendarIcon, MessageSquare, ChevronRight } from 'lucide-react-native';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

const VendorDashboard = () => {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ earnings: 0, bookings: 0, inquiries: 0 });
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!state.user?.id) { setLoading(false); return; }
      try {
        const { data: recent, error } = await supabase
          .from('bookings')
          .select('id, status, amount, event_id, created_at')
          .eq('vendor_id', state.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        const list = recent || [];
        const earned = list.reduce((s, b) => s + (b.amount || 0), 0);
        const active = list.filter(b => b.status === 'confirmed').length;
        const pending = list.filter(b => b.status === 'pending').length;
        
        setStats({ earnings: earned, bookings: active, inquiries: pending });
        setRecentInquiries(list.filter(b => b.status === 'pending'));
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [state.user?.id]);

  const userName = state.user?.user_metadata?.full_name || state.user?.name || 'Vendor';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bell}>
          <Bell size={20} color="#0F172A" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, styles.kpiPrimary]}>
            <Text style={[styles.kpiValue, { color: 'white' }]}>${stats.earnings.toLocaleString()}</Text>
            <Text style={[styles.kpiLabel, { color: 'rgba(255,255,255,0.85)' }]}>Total Earnings</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{stats.bookings}</Text>
            <Text style={styles.kpiLabel}>Active Bookings</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{stats.inquiries}</Text>
            <Text style={styles.kpiLabel}>Inquiries</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Inquiries</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator style={{ margin: 20 }} color="#1F4E79" />
          ) : recentInquiries.length === 0 ? (
            <Text style={styles.emptyText}>No new inquiries. Share your profile to attract leads.</Text>
          ) : (
            recentInquiries.map((inq) => (
              <TouchableOpacity key={inq.id} style={styles.inquiryCard}>
                <View style={styles.inquiryAv}>
                  <Text style={styles.inquiryAvText}>{inq.event_id?.charAt(0) || 'E'}</Text>
                </View>
                <View style={styles.inquiryInfo}>
                  <Text style={styles.inquiryTitle}>Event Request</Text>
                  <Text style={styles.inquirySub}>${inq.amount} · Pending</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendar Overview</Text>
          </View>
          <View style={styles.calendarPlaceholder}>
            <CalendarIcon size={32} color="#CBD5E1" style={{marginBottom: 8}} />
            <Text style={styles.emptyText}>Calendar synced successfully. No events this week.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1F4E79',
    fontWeight: '700',
    fontSize: 16,
  },
  greeting: {
    fontSize: 12,
    color: '#64748B',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
    borderWidth: 2,
    borderColor: 'white',
  },
  kpiGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  kpiPrimary: {
    backgroundColor: '#1F4E79',
    borderColor: '#1F4E79',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F4E79',
  },
  inquiryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inquiryAv: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inquiryAvText: {
    color: '#1F4E79',
    fontWeight: '700',
    fontSize: 14,
  },
  inquiryInfo: {
    flex: 1,
  },
  inquiryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  inquirySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    padding: 20,
  },
  calendarPlaceholder: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  }
});

export default VendorDashboard;
