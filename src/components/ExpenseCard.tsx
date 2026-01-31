import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Expense } from '../types';
import { Colors } from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/formatting';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore } from '../store/settingsStore';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

/**
 * Reusable expense card component
 */
const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { categories } = useExpenseStore();
  // Subscribe to currency changes to trigger re-render
  useSettingsStore(state => state.currency);

  // Find category color
  const category = categories.find((cat) => cat.name === expense.category);
  const categoryColor = category?.color || colors.textSecondary;

  const styles = createStyles(colors, categoryColor);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.categoryIndicator} />
        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{expense.category}</Text>
            <Text style={styles.date}>{formatDate(expense.date)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof Colors.light, categoryColor: string) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      marginVertical: 4,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    leftSection: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
    },
    categoryIndicator: {
      width: 4,
      height: 40,
      backgroundColor: categoryColor,
      borderRadius: 2,
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    description: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    category: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    date: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    amount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
  });

export default ExpenseCard;

