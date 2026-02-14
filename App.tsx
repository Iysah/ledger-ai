import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/db';
import { useExpenseStore } from './src/store/expenseStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Main App Component
 * Initializes database and sets up navigation
 */
export default function App() {
  const colorScheme = useColorScheme();
  const { loadCategories, loadExpenses, loadIncomes } = useExpenseStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Lato-Black': require('./assets/fonts/Lato-Black.ttf'),
          'Lato-BlackItalic': require('./assets/fonts/Lato-BlackItalic.ttf'),
          'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
          'Lato-BoldItalic': require('./assets/fonts/Lato-BoldItalic.ttf'),
          'Lato-Italic': require('./assets/fonts/Lato-Italic.ttf'),
          'Lato-Light': require('./assets/fonts/Lato-Light.ttf'),
          'Lato-LightItalic': require('./assets/fonts/Lato-LightItalic.ttf'),
          'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
          'Lato-Thin': require('./assets/fonts/Lato-Thin.ttf'),
          'Lato-ThinItalic': require('./assets/fonts/Lato-ThinItalic.ttf'),
        });

        // Initialize database
        await initDatabase();
        
        // Load initial data
        await Promise.all([
          loadCategories(),
          loadExpenses(),
          loadIncomes(),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we do this this means we need to hide it here
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppNavigator />
        <Toaster />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

