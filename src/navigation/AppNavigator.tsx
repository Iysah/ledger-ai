import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

// Screens
import ExpenseListScreen from '../screens/ExpenseListScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ReportsScreen from '../screens/ReportsScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';

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
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ExpenseListScreen}
        options={{
          title: 'Expenses',
          tabBarLabel: 'Home',
          tabBarIcon: () => null, // Simple text-only tabs
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: 'Add Expense',
          tabBarLabel: 'Add',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarLabel: 'Reports',
          tabBarIcon: () => null,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

