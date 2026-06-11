import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Map, Settings, SlidersHorizontal, Star, Heart, Search, X } from 'lucide-react-native';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

// Deterministic pseudo-availability
const unavailableFor = (vendorId, dateStr) => {
  if (!dateStr) return false;
  const day = new Date(dateStr).getTime() / 86400000 | 0;
  return ((vendorId * 73 + day * 17) % 10) < 3;
};

const nextOpenDates = (vendorId, from, n = 3) => {
  const out = [];
  const start = from ? new Date(from) : new Date();
  let cursor = new Date(start);
  let safety = 60;
  while (out.length < n && safety > 0) {
    cursor.setDate(cursor.getDate() + 1);
    if (!unavailableFor(vendorId, cursor.toISOString())) {
      out.push(new Date(cursor));
    }
    safety -= 1;
  }
  return out;
};

const formatShortDate = (d) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

const VendorDiscovery = () => {
  const navigation = useNavigation();
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideUnavailable, setHideUnavailable] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const ev = state.event || {};
  const eventTitle = ev.title || "Your Event";
  const eventDate = ev.date || null;
  const eventGuests = ev.guests || state.guests || 100;
  const eventBudget = ev.budget || state.budget || 60000;
  const eventLocation = ev.location || 'Vancouver, BC';

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('vendors').select('*');
        if (error) throw error;
        setVendors(data || []);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const formatDate = (d) => {
    if (!d) return 'No date set';
    try {
      const date = new Date(d);
      return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
    } catch { return d; }
  };

  const vendorsWithAvail = useMemo(() => {
    return vendors.map(v => {
      const available = !unavailableFor(v.id, eventDate);
      const priceUnit = v.category?.toLowerCase().includes('cater') ? '/ guest' : '';
      const projected = priceUnit === '/ guest' ? v.starting_price * eventGuests : v.starting_price;
      const fitsBudget = projected <= eventBudget * 0.6;
      
      return {
        ...v,
        name: v.business_name,
        image: v.portfolio_urls?.[0] || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop&q=80',
        tags: v.category,
        priceFrom: v.starting_price || 0,
        priceUnit,
        replies: '~2h',
        available,
        projected,
        fitsBudget,
        rating: v.rating || 4.5,
        reviews: v.reviews || 12,
        replyMins: 120,
        nextDates: nextOpenDates(v.id, eventDate, 3),
        location: v.location || 'Unknown',
        languages: v.languages || ['English']
      };
    });
  }, [vendors, eventDate, eventGuests, eventBudget]);

  const filteredVendors = vendorsWithAvail
    .filter(v => activeTab === 'All'
      ? true
      : ((v.category || '').toLowerCase().includes(activeTab.toLowerCase()) || activeTab.toLowerCase().includes((v.category || '').toLowerCase())))
    .filter(v => hideUnavailable ? v.available : true)
    .filter(v => v.location.toLowerCase() === eventLocation.toLowerCase())
    .filter(v => selectedLanguage ? v.languages.includes(selectedLanguage) : true)
    .sort((a, b) => (b.available - a.available) || (b.rating - a.rating));

  const allLanguages = ['English', 'Spanish', 'Mandarin', 'French'];
  const hasLocationVendors = vendorsWithAvail.some(v => v.location.toLowerCase() === eventLocation.toLowerCase());
  const categories = ['All', 'Caterers', 'Venues', 'Decor', 'Anchor', 'DJ', 'Photographer'];

  const popularDestinations = [
    { city: 'Paris, France', emoji: '🇫🇷' },
    { city: 'Bali, Indonesia', emoji: '🇮🇩' },
    { city: 'Santorini, Greece', emoji: '🇬🇷' },
    { city: 'Lake Como, Italy', emoji: '🇮🇹' },
    { city: 'Cancun, Mexico', emoji: '🇲🇽' },
    { city: 'Vancouver, Canada', emoji: '🇨🇦' },
    { city: 'New York, USA', emoji: '🇺🇸' }
  ];

  const updateLocation = (loc) => {
    updateState({ event: { ...(state.event || {}), location: loc } });
    setShowLocationModal(false);
  };

  const renderVendorCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.vendorCard, !item.available && styles.vendorCardDimmed]}
      activeOpacity={0.9}
      onPress={() => {
        updateState({ selectedVendor: item });
        navigation.navigate('VendorProfile');
      }}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.vendorImage} />
        <View style={[styles.proBadge, item.type === 'Premium' && styles.premiumBadge]}>
          <Text style={styles.proBadgeText}>{item.type === 'Premium' ? '★ Premium' : 'PRO'}</Text>
        </View>
        {item.fitsBudget && (
          <View style={[styles.proBadge, { top: 40, backgroundColor: '#10B981' }]}>
            <Text style={styles.proBadgeText}>$ Under Budget</Text>
          </View>
        )}
        <TouchableOpacity style={styles.heartButton}>
          <Heart color="white" size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorTags}>{item.tags}</Text>
        
        <View style={styles.ratingRow}>
          <Star color="#F59E0B" size={14} fill="#F59E0B" />
          <Text style={styles.ratingText}> {item.rating} <Text style={styles.reviewText}>({item.reviews})</Text> <Text style={styles.dotSep}>·</Text> Replies {item.replies}</Text>
        </View>

        {item.nextDates && item.nextDates.length > 0 ? (
          <View style={styles.datesRow}>
            <Text style={styles.datesLabel}>Open:</Text>
            {item.nextDates.map((d, i) => (
              <View key={i} style={styles.dateChip}>
                <Text style={styles.dateChipText}>{formatShortDate(d)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.datesRow}>
            <View style={[styles.dateChip, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.dateChipText, { color: '#475569' }]}>Booked for season</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>From ${item.priceFrom.toLocaleString()} <Text style={styles.priceUnit}>{item.priceUnit}</Text></Text>
          {item.available ? (
            <View style={styles.availBadge}>
              <Text style={styles.availText}>● Available</Text>
            </View>
          ) : (
            <View style={[styles.availBadge, styles.bookedBadge]}>
              <Text style={[styles.availText, styles.bookedText]}>● Booked</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.title}>{eventTitle}</Text>
              <Text style={styles.subtitle}>{formatDate(eventDate)} · {eventGuests} guests</Text>
            </View>
            <View style={styles.iconsRow}>
              <TouchableOpacity style={styles.iconBtn}><Map size={20} color="#0F172A" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Settings size={20} color="#0F172A" /></TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.eventStrip} onPress={() => setShowLocationModal(true)}>
            <View style={styles.dot} />
            <Text style={styles.stripText}>Budget ${(eventBudget || 0).toLocaleString()} · {eventLocation}</Text>
          </TouchableOpacity>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersScrollContent}>
            {allLanguages.map(l => (
              <TouchableOpacity 
                key={l}
                style={[styles.filterChip, selectedLanguage === l && styles.filterChipActive]}
                onPress={() => setSelectedLanguage(selectedLanguage === l ? '' : l)}
              >
                <Text style={[styles.filterChipText, selectedLanguage === l && styles.filterChipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.tab, activeTab === cat && styles.activeTab]}
            onPress={() => setActiveTab(cat)}
          >
            <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          <Text style={{fontWeight: '700'}}>{filteredVendors.filter(v => v.available).length} vendors</Text> available {eventDate ? `on ${formatDate(eventDate)}` : ''}
        </Text>
        <TouchableOpacity 
          style={styles.toggleRow} 
          onPress={() => setHideUnavailable(!hideUnavailable)}
        >
          <SlidersHorizontal size={14} color="#64748B" />
          <Text style={styles.toggleText}>{hideUnavailable ? 'Available only' : 'Show all'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#B91C1C" /></View>
      ) : !hasLocationVendors ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>We're expanding! ✈️</Text>
          <Text style={styles.emptyText}>Eventore is coming to {eventLocation} soon. We are actively onboarding the best premium vendors in this region.</Text>
          <TouchableOpacity style={styles.waitlistBtn}>
            <Text style={styles.waitlistBtnText}>Join the Waitlist</Text>
          </TouchableOpacity>
        </View>
      ) : filteredVendors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vendors match your filters. Try changing the date or showing all.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={item => item.id.toString()}
          renderItem={renderVendorCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* LOCATION SEARCH MODAL */}
      <Modal visible={showLocationModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLocationModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12 }}>
              <Search size={18} color="#64748B" />
              <TextInput
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: '#0F172A' }}
                placeholder="Search destination city..."
                value={locationSearch}
                onChangeText={setLocationSearch}
                autoFocus
              />
              {locationSearch.length > 0 && (
                <TouchableOpacity onPress={() => setLocationSearch('')} style={{ padding: 4 }}>
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowLocationModal(false)} style={{ marginLeft: 16, padding: 4 }}>
              <X size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            {locationSearch.length > 2 && (
              <TouchableOpacity style={styles.destRow} onPress={() => updateLocation(locationSearch)}>
                <Map size={20} color="#64748B" />
                <Text style={styles.destText}>Search "{locationSearch}" anywhere</Text>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B', marginTop: 16, marginBottom: 8 }}>Popular Global Destinations</Text>
            {popularDestinations.filter(d => d.city.toLowerCase().includes(locationSearch.toLowerCase())).map((dest) => (
              <TouchableOpacity key={dest.city} style={styles.destRow} onPress={() => updateLocation(dest.city)}>
                <Text style={{ fontSize: 20 }}>{dest.emoji}</Text>
                <Text style={styles.destText}>{dest.city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 16,
    marginTop: 4
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  iconsRow: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    padding: 4,
  },
  eventStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#B91C1C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start', marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white', marginRight: 6 },
  stripText: { color: 'white', fontSize: 12, fontWeight: '600' },
  filtersScroll: { marginTop: 12, marginHorizontal: -20 },
  filtersScrollContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: 'white' },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: 'white' },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#0F172A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: 'white',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 13,
    color: '#475569',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  vendorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vendorCardDimmed: {
    opacity: 0.55,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
  },
  proBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadge: {
    backgroundColor: '#B91C1C',
  },
  proBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  vendorInfo: {
    padding: 16,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  vendorTags: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewText: {
    color: '#64748B',
    fontWeight: '400',
  },
  dotSep: {
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  datesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dateChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateChipText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748B',
  },
  availBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  availText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  bookedBadge: {
    backgroundColor: '#FEF2F2',
  },
  bookedText: {
    color: '#991B1B',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  emptyText: { color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  waitlistBtn: { backgroundColor: '#B91C1C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  waitlistBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  destRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  destText: { fontSize: 16, fontWeight: '600', color: '#0F172A' }
});

export default VendorDiscovery;
