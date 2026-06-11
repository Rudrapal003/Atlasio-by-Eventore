import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, AlertCircle, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const Login = () => {
  const { updateState } = useApp();
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(hasHardware && isEnrolled);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkBiometrics();
  }, []);

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : '+1' + phone.replace(/\D/g, ''),
      });
      if (otpError) throw otpError;
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : '+1' + phone.replace(/\D/g, '');
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      if (verifyError) throw verifyError;
      
      if (data?.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle();

        let resolvedUserType = profile?.user_type || 'planner';
        updateState({ 
          isLoggedIn: true, 
          user: data.session.user, 
          userType: resolvedUserType 
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setError(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Eventore',
        fallbackLabel: 'Use code',
      });

      if (result.success) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
           const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          updateState({ 
            isLoggedIn: true, 
            user: session.user, 
            userType: profile?.user_type || 'planner' 
          });
        } else {
          setError('No saved session found. Please log in with phone once.');
        }
      }
    } catch {
      setError('Biometric authentication failed.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1EB' }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 'otp' ? setStep('phone') : navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Login</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        {step === 'phone' ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={styles.input}
                placeholder="(555) 000-0000"
                value={phone}
                onChangeText={(t) => { setPhone(t); setError(null); }}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Send Code</Text>
              )}
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity 
                style={styles.bioButton} 
                onPress={handleBiometricAuth}
              >
                <Fingerprint size={20} color="#1F4E79" />
                <Text style={styles.bioButtonText}>Sign in with Biometrics</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput 
                style={styles.input}
                placeholder="000000"
                value={otp}
                onChangeText={(t) => { setOtp(t); setError(null); }}
                keyboardType="number-pad"
              />
              <Text style={{fontSize: 12, color: '#64748B', marginTop: 8}}>Sent to {phone}</Text>
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Verify & Login</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1EB',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
  },
  form: {
    paddingHorizontal: 24,
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
    backgroundColor: 'white',
    color: '#0F172A',
  },
  loginButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bioButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  bioButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  signupLink: {
    fontSize: 14,
    color: '#1F4E79',
    fontWeight: '600',
  },
});

export default Login;
