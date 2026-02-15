import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency } from '../utils/formatting';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Basic Reports Screen showing expense statistics
 */
const ReportsScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { expenses, loadExpenses } = useExpenseStore();
  const { currency } = useSettingsStore();

  useEffect(() => {
    loadExpenses();
  }, []);

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  // Group by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryStats = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Insights</Text>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
          <Text style={styles.summaryValue}>{expenseCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Average Expense</Text>
          <Text style={styles.summaryValue}>{formatCurrency(averageExpense)}</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Category</Text>
        {categoryStats.length > 0 ? (
          categoryStats.map((stat) => {
            const percentage = (stat.total / totalExpenses) * 100;
            return (
              <View key={stat.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{stat.category}</Text>
                  <Text style={styles.categoryPercentage}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(stat.total)}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No expenses to display</Text>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      fontFamily: 'Lato-Bold',
      color: colors.text,
      marginBottom: 24,
    },
    summaryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    summaryCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryLabel: {
      fontSize: 14,
      fontFamily: 'Lato-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '700',
      fontFamily: 'Lato-Bold',
      color: colors.text,
    },
    section: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      fontFamily: 'Lato-Bold',
      color: colors.text,
      marginBottom: 16,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    categoryPercentage: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    categoryAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 32,
    },
  });

export default ReportsScreen;

