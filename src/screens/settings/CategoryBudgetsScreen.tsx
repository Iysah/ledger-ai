import React from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import CategoryList from '../../components/CategoryList';
import { SafeAreaView } from 'react-native-safe-area-context';

const CategoryBudgetsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Category Budgets</Text>
        <CategoryList />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});

export default CategoryBudgetsScreen;
