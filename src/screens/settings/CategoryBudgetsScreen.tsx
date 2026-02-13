import React from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import CategoryList from '../../components/CategoryList';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';

const CategoryBudgetsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, { color: colors.text }]}>Category Budgets</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CategoryList />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CategoryBudgetsScreen;
