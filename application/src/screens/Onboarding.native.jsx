import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../AppContext';
import { User, Briefcase } from 'lucide-react-native';

const Onboarding = () => {
  const { updateState } = useApp();
  const navigation = useNavigation();

  const selectUserType = (type) => {
    updateState({ userType: type });
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Eventore</Text>
        <Text style={styles.subtitle}>One stop. Every event.</Text>
        
        <Text style={styles.question}>How will you use Eventore?</Text>
        
        <TouchableOpacity style={styles.card} onPress={() => selectUserType('planner')}>
          <View style={[styles.iconBox, { backgroundColor: '#E11D48' }]}>
            <User size={28} color="white" />
          </View>
          <View>
            <Text style={styles.cardTitle}>I'm a Planner</Text>
            <Text style={styles.cardDesc}>Planning a wedding or event</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => selectUserType('vendor')}>
          <View style={[styles.iconBox, { backgroundColor: '#059669' }]}>
            <Briefcase size={28} color="white" />
          </View>
          <View>
            <Text style={styles.cardTitle}>I'm a Creator</Text>
            <Text style={styles.cardDesc}>Caterer, Photographer, Venue, etc.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontSize: 42,
    color: '#1F4E79',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    marginBottom: 48,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#0F172A',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    width: '100%',
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    color: '#1F4E79',
    fontWeight: '600',
  },
});

export default Onboarding;
