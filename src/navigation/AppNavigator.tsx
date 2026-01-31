import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, useColorScheme } from 'react-native';
import { Home, Plus, BarChart3, Settings, MessageSquare } from 'lucide-react-native';
import { Colors } from '../constants/colors';

// Screens
import ExpenseListScreen from '../screens/ExpenseListScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import { ChatScreen } from '../screens/ChatScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Settings Sub-screens
import ManageBudgetScreen from '../screens/settings/ManageBudgetScreen';
import CategoryBudgetsScreen from '../screens/settings/CategoryBudgetsScreen';
import CategoryScreen from '../screens/settings/CategoriesScreen';
import PremiumScreen from '../screens/settings/PremiumScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import { getHasSeenOnboarding } from '../utils/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main tab navigator with Home, Add, and Reports tabs
 */
const MainTabs = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 85,
          paddingTop: 8
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ExpenseListScreen}
        options={{
          // title: 'Expenses',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          // title: 'Add Expense',
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Assistant"
        component={ChatScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          // title: 'Reports',
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root stack navigator that wraps the tab navigator
 * and includes modal screens like EditExpense
 */
const AppNavigator = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getHasSeenOnboarding() ? 'MainTabs' : 'Onboarding'}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditExpense"
          component={EditExpenseScreen}
          options={{
            title: 'Edit Expense',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ManageBudget"
          component={ManageBudgetScreen}
          options={{ 
            title: 'Manage Budget',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageCategories"
          component={CategoryScreen}
          options={{ 
            title: 'Manage Categories',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CategoryBudgets"
          component={CategoryBudgetsScreen}
          options={{ title: 'Category Budgets' }}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{ title: 'Premium Features' }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: 'About Moniqa' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

