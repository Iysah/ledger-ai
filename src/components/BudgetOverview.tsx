import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/formatting';
import { calculateBudgetOverview, getBudgetStatusColor } from '../utils/budget';

const BudgetOverview = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { budgets, categorySpends } = useExpenseStore();
  // Subscribe to currency changes to trigger re-render
  useSettingsStore(state => state.currency);

  const { totalBudget, totalSpent, remaining, percentage } = calculateBudgetOverview(budgets, categorySpends);
  const statusColor = getBudgetStatusColor(percentage);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>Total Budget</Text>
      <View style={styles.row}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(totalBudget)}
        </Text>
        <Text style={[styles.spentText, { color: colors.textSecondary }]}>
          Spent: {formatCurrency(totalSpent)}
        </Text>
      </View>

      <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${percentage}%`, 
              backgroundColor: statusColor 
            }
          ]} 
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.remainingText, { color: colors.textSecondary }]}>Remaining</Text>
        <Text style={[styles.remainingAmount, { color: statusColor }]}>
          {formatCurrency(remaining)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
  },
  spentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default BudgetOverview;
