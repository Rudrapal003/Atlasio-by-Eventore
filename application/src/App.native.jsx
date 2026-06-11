import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

// Navigation Imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import EventDashboard from './screens/EventDashboard';
import VendorDashboard from './screens/VendorDashboard.native';
import VendorDiscovery from './screens/VendorDiscovery';
import VendorProfile from './screens/VendorProfile';
import VendorOnboarding from './screens/VendorOnboarding';
import DayOfTimelineNative from './screens/DayOfTimeline.native';
import MultiVendorCheckoutNative from './screens/MultiVendorCheckout.native';
import DisputeFlowNative from './screens/DisputeFlow.native';
import ReviewPromptNative from './screens/ReviewPrompt.native';

const Stack = createStackNavigator();

import { AppContext } from './AppContext';

function App() {
  const [state, setState] = useState({
    userType: null,
    isLoggedIn: false,
    user: null,
    event: {
      type: null,
      title: '',
      date: null,
      guests: null,
      budget: null,
      location: '',
      culturalTags: []
    },
    budget: null,
    guests: null,
    selectedVendor: null,
    selectedPackage: null,
    inquiries: [],
    bookings: []
  });

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Push notifications temporarily disabled for Expo Go compatibility

  useEffect(() => {
    const fetchProfile = async (session) => {
      if (!session) return;
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
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session);
      } else {
        updateState({ isLoggedIn: false, user: null, userType: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ state, updateState }}>
      <StatusBar style={state.userType === 'vendor' ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!state.isLoggedIn ? (
            <>
              <Stack.Screen name="Onboarding" component={Onboarding} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Login} />
            </>
          ) : state.userType === 'vendor' ? (
            <>
              <Stack.Screen name="VendorOnboarding" component={VendorOnboarding} />
              <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
            </>
          ) : (
            <>
              <Stack.Screen name="EventDashboard" component={EventDashboard} />
              <Stack.Screen name="VendorDiscovery" component={VendorDiscovery} />
              <Stack.Screen name="VendorProfile" component={VendorProfile} />
              <Stack.Screen name="DayOfTimeline" component={DayOfTimelineNative} />
              <Stack.Screen name="MultiVendorCheckout" component={MultiVendorCheckoutNative} />
              <Stack.Screen name="DisputeFlow" component={DisputeFlowNative} />
              <Stack.Screen name="ReviewPrompt" component={ReviewPromptNative} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;
