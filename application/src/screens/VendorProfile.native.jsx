import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Share2, Heart, MapPin, CheckCircle2 } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';

const isAvailable = (vendorId, date) => {
  if (!date) return true;
  const day = (new Date(date).getTime() / 86400000) | 0;
  return ((vendorId * 73 + day * 17) % 10) >= 3;
};

const SAMPLE_REVIEWS = [
  { id: 1, author: 'Aisha S.', rating: 5, body: 'Showed up on time, food was incredible, my mom literally cried. Worth every penny.', verified: true, date: '2 weeks ago' },
  { id: 2, author: 'Daniel R.', rating: 5, body: 'Booked through Eventore for our engagement — super smooth, no surprise charges.', verified: true, date: '1 month ago' },
  { id: 3, author: 'Priya M.', rating: 4, body: 'Great food, slight delay on setup but they communicated well. Would book again.', verified: true, date: '2 months ago' }
];

const VendorProfile = () => {
  const { state, updateState } = useApp();
  const navigation = useNavigation();
  const vendor = state.selectedVendor;
  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [activeTab, setActiveTab] = useState('Packages');
  const [saved, setSaved] = useState(false);
  
  const eventDate = state.event?.date;
  const available = useMemo(() => vendor ? isAvailable(vendor.id, eventDate) : true, [vendor, eventDate]);

  useEffect(() => {
    const fetchPackages = async () => {
      if (!vendor?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('packages').select('*').eq('vendor_id', vendor.id);
        if (error) throw error;
        setPackages(data || []);
        if (data && data.length > 0) {
          setSelectedPkg(data[0]);
          updateState({ selectedPackage: data[0] });
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [vendor?.id]);

  if (!vendor) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyText}>No vendor selected.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('VendorDiscovery')}>
          <Text style={styles.primaryButtonText}>Browse vendors</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSelect = (pkg) => { 
    setSelectedPkg(pkg); 
    updateState({ selectedPackage: pkg }); 
  };

  const handleSave = () => setSaved(s => !s);

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: vendor.image }} style={styles.heroImage}>
          <SafeAreaView>
            <View style={styles.heroOverlay}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                <ArrowLeft size={20} color="#0F172A" />
              </TouchableOpacity>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Share2 size={20} color="#0F172A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
                  <Heart size={20} color={saved ? "#E11D48" : "#0F172A"} fill={saved ? "#E11D48" : "transparent"} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            {vendor.type === 'Premium' && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>★ PREMIUM</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.vendorTags}>{vendor.tags || 'Premium Service'}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statBold}>★ {vendor.rating}</Text>
              <Text style={styles.statLight}> · {vendor.reviews} reviews</Text>
            </View>
            <View style={styles.statItem}>
              <MapPin size={14} color="#64748B" />
              <Text style={styles.statLight}> Vancouver, BC</Text>
            </View>
          </View>

          {!available && (
            <View style={styles.bookedWarning}>
              <Text style={styles.bookedWarningText}>Unavailable on your event date.</Text>
            </View>
          )}

          <View style={styles.tabsContainer}>
            {['Packages', 'About', 'Reviews'].map(tab => (
              <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#B91C1C" />
            </View>
          ) : (
            <View style={styles.tabContent}>
              {activeTab === 'Packages' && (
                packages.length === 0 ? (
                  <Text style={styles.emptyText}>No packages available.</Text>
                ) : packages.map(pkg => (
                  <TouchableOpacity 
                    key={pkg.id} 
                    style={[styles.packageCard, selectedPkg?.id === pkg.id && styles.packageCardSelected, pkg.featured && !selectedPkg && styles.packageCardFeatured]}
                    onPress={() => handleSelect(pkg)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.packageHeader}>
                      <View style={{flex: 1}}>
                        <Text style={styles.packageName}>{pkg.name}</Text>
                        {pkg.note && <Text style={styles.packageNote}>{pkg.note}</Text>}
                      </View>
                      <Text style={styles.packagePrice}>${pkg.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.packageIncludes}>
                      {pkg.includes?.map((inc, i) => (
                        <View key={i} style={styles.includeRow}>
                          <CheckCircle2 size={12} color="#0F172A" />
                          <Text style={styles.includeText}>{inc}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))
              )}

              {activeTab === 'About' && (
                <View style={styles.aboutSection}>
                  <Text style={styles.sectionTitle}>About {vendor.name}</Text>
                  <Text style={styles.aboutText}>A premium event service specializing in {(vendor.tags || 'events').toLowerCase()}. {vendor.reviews}+ successful events across Greater Vancouver.</Text>
                  
                  <Text style={[styles.sectionTitle, {marginTop: 24}]}>Portfolio</Text>
                  <View style={styles.portfolioGrid}>
                    {(vendor.portfolio_urls && vendor.portfolio_urls.length > 0 
                      ? vendor.portfolio_urls 
                      : [1,2,3,4,5,6].map((_, i) => `https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=300&fit=crop`)
                    ).map((url, i) => (
                      <View key={i} style={styles.portfolioImageWrapper}>
                        <Image source={{uri: url}} style={styles.portfolioImage} />
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === 'Reviews' && (
                <View style={styles.reviewsSection}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewScore}>{vendor.rating}</Text>
                    <View>
                      <Text style={styles.reviewCount}>{vendor.reviews} reviews</Text>
                      <Text style={styles.reviewVerified}>{SAMPLE_REVIEWS.filter(r => r.verified).length} verified bookings</Text>
                    </View>
                  </View>
                  
                  {SAMPLE_REVIEWS.map(r => (
                    <View key={r.id} style={styles.reviewCard}>
                      <View style={styles.reviewAuthorRow}>
                        <Text style={styles.reviewAuthor}>{r.author}</Text>
                        <Text style={styles.reviewDate}>{r.date}</Text>
                      </View>
                      <Text style={styles.reviewBody}>{r.body}</Text>
                      {r.verified && (
                        <View style={styles.verifiedBadge}>
                          <CheckCircle2 size={10} color="#059669" />
                          <Text style={styles.verifiedText}>Verified by Eventore booking</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{selectedPkg ? `Selected ${selectedPkg.name}` : 'Starting from'}</Text>
          <Text style={styles.priceValue}>${selectedPkg ? selectedPkg.price.toLocaleString() : (vendor.priceFrom || 0).toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, (!available || !selectedPkg) && styles.bookButtonDisabled]}
          disabled={!available || !selectedPkg}
          onPress={() => {
            updateState({ bookings: [...(state.bookings || []), { vendor, package: selectedPkg }] });
            Alert.alert(
              'Booking Confirmed', 
              `You have successfully booked ${selectedPkg.name} with ${vendor.name}!`,
              [{ text: 'Go to Dashboard', onPress: () => navigation.navigate('EventDashboard') }]
            );
          }}
        >
          <Text style={styles.bookButtonText}>
            {!available ? 'Unavailable' : (selectedPkg ? 'Confirm Selection' : 'Select a Package')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 260, justifyContent: 'flex-start' },
  heroOverlay: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10 },
  heroActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { backgroundColor: 'white', padding: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  content: { padding: 20, backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  vendorName: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  premiumBadge: { backgroundColor: '#B91C1C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  premiumBadgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  vendorTags: { fontSize: 15, color: '#64748B', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statBold: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statLight: { fontSize: 14, color: '#64748B' },
  bookedWarning: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  bookedWarningText: { color: '#991B1B', fontWeight: '600', textAlign: 'center' },
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 20 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#0F172A' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#0F172A' },
  tabContent: { paddingBottom: 20 },
  loaderContainer: { padding: 40, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
  packageCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  packageCardFeatured: { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
  packageCardSelected: { borderColor: '#B91C1C', borderWidth: 2, backgroundColor: '#FEF2F2' },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  packageName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  packageNote: { fontSize: 13, color: '#64748B', marginTop: 2 },
  packagePrice: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  packageIncludes: { gap: 6 },
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  includeText: { fontSize: 14, color: '#475569' },
  aboutSection: {},
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  aboutText: { fontSize: 15, color: '#475569', lineHeight: 22 },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  portfolioImageWrapper: { width: '31%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  portfolioImage: { width: '100%', height: '100%' },
  reviewsSection: {},
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  reviewScore: { fontSize: 48, fontWeight: '800', color: '#0F172A' },
  reviewCount: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  reviewVerified: { fontSize: 13, color: '#64748B' },
  reviewCard: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  reviewAuthorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewAuthor: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  reviewDate: { fontSize: 13, color: '#64748B' },
  reviewBody: { fontSize: 15, color: '#334155', lineHeight: 22, marginBottom: 8 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 11, fontWeight: '600', color: '#059669' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
  priceContainer: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  bookButton: { backgroundColor: '#B91C1C', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  bookButtonDisabled: { backgroundColor: '#E2E8F0' },
  bookButtonText: { color: 'white', fontWeight: '700', fontSize: 15 },
  primaryButton: { backgroundColor: '#0F172A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  primaryButtonText: { color: 'white', fontWeight: '700' }
});

export default VendorProfile;
