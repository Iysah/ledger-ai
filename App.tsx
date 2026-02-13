import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/db';
import { useExpenseStore } from './src/store/expenseStore';

/**
 * Main App Component
 * Initializes database and sets up navigation
 */
export default function App() {
  const colorScheme = useColorScheme();
  const { loadCategories, loadExpenses, loadIncomes } = useExpenseStore();

  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      try {
        await initDatabase();
        // Load initial data
        await loadCategories();
        await loadExpenses();
        await loadIncomes();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppNavigator />
        <Toaster />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

