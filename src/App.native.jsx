import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from './lib/supabaseClient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

// App State Context
const AppContext = createContext();

export const useApp = () => useContext(AppContext);

function App() {
  const [state, setState] = useState({
    userType: null,
    isLoggedIn: false,
    user: null,
    event: {
      type: null,
      title: '',
      date: null,
      guests: 250,
      budget: 60000,
      location: '',
      culturalTags: []
    },
    budget: 60000,
    guests: 250,
    selectedVendor: null,
    selectedPackage: null,
    inquiries: [],
    bookings: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateState({ isLoggedIn: true, user: session.user });
        registerForPushNotificationsAsync(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        updateState({ isLoggedIn: true, user: session.user });
        registerForPushNotificationsAsync(session.user.id);
      } else {
        updateState({ isLoggedIn: false, user: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  async function registerForPushNotificationsAsync(userId) {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      if (userId) {
        await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', userId);
      }
    }
    return token;
  }

  return (
    <AppContext.Provider value={{ state, updateState }}>
      <View style={styles.container}>
        <StatusBar style={state.userType === 'creator' ? 'light' : 'dark'} />
        <Text style={styles.title}>Evently Mobile</Text>
        <Text style={styles.subtitle}>Native bridge established.</Text>
        <Text style={styles.text}>
          We are currently porting the web UI components (div/span) to Native components (View/Text).
          Check back soon for the full mobile experience!
        </Text>
      </View>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default App;
