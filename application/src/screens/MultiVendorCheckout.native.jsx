import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react-native';

export default function MultiVendorCheckoutNative({ navigation }) {
  const cartItems = [
    { id: 1, vendor: 'Tandoor & Co', package: 'Royal Buffet Package', price: 12500, type: 'Caterer' },
    { id: 2, vendor: 'Aegean Aesthetics', package: 'Bronze Decor', price: 3500, type: 'Decor' },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const platformFee = subtotal * 0.03; // 3% fee
  const total = subtotal + platformFee;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1c1c1e" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review Your Booking</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.vendorName}>{item.vendor}</Text>
                <Text style={styles.packageDetails}>{item.package}</Text>
                <Text style={styles.vendorType}>{item.type}</Text>
              </View>
              <Text style={styles.priceText}>${item.price.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee (3%)</Text>
            <Text style={styles.summaryValue}>${platformFee.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Due Today</Text>
            <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.secureBox}>
          <ShieldCheck color="#34c759" size={24} />
          <Text style={styles.secureText}>Payments are securely split and held in escrow until the event is completed.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={() => navigation.goBack()}>
          <CreditCard color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.payButtonText}>Pay ${total.toLocaleString()}</Text>
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
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1c1c1e' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f7' },
  itemInfo: { flex: 1 },
  vendorName: { fontSize: 16, fontWeight: '600', color: '#1c1c1e', marginBottom: 4 },
  packageDetails: { fontSize: 14, color: '#333', marginBottom: 4 },
  vendorType: { fontSize: 12, color: '#8e8e93', textTransform: 'uppercase' },
  priceText: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#8e8e93' },
  summaryValue: { fontSize: 14, color: '#1c1c1e', fontWeight: '500' },
  totalRow: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e5e5ea' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1c1c1e' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#007aff' },
  secureBox: { flexDirection: 'row', backgroundColor: '#e5f6eb', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
  secureText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#248a3d', lineHeight: 18 },
  footer: { backgroundColor: '#fff', padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#e5e5ea' },
  payButton: { backgroundColor: '#007aff', flexDirection: 'row', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
