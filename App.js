import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { JobProvider } from './src/context/JobContext';
import { TradespeopleProvider } from './src/context/TradespeopleContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TradespeopleProvider>
          <JobProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </JobProvider>
        </TradespeopleProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
