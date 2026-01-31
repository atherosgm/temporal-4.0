import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './supabaseClient';
import { SettingsProvider } from './SettingsContext';

import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import RequestServiceScreen from './screens/RequestServiceScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="RequestService" component={RequestServiceScreen} />
              <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}