import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore } from '../store/settingsStore';
import { getIcon } from '../utils/icons';
import { formatCurrency } from '../utils/formatting';

interface CategoryListProps {
  limit?: number;
  onSeeAll?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ limit, onSeeAll }) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { categories, budgets, categorySpends } = useExpenseStore();
  // Subscribe to currency changes
  useSettingsStore(state => state.currency);

  const displayCategories = limit ? categories.slice(0, limit) : categories;

  const renderItem = ({ item }: { item: any }) => {
    const Icon = getIcon(item.icon);
    const budget = budgets.find(b => b.category === item.name)?.amount || 0;
    const spent = categorySpends[item.name] || 0;
    
    // Percentage for mini progress bar
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    let statusColor = colors.primary;
    if (percentage > 85) statusColor = '#F44336';
    
    return (
      <TouchableOpacity style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Icon size={24} color={item.color} />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.spentAmount, { color: colors.text }]}>
                {formatCurrency(spent)}
              </Text>
              <Text style={[styles.budgetAmount, { color: colors.textSecondary }]}>
                 / {formatCurrency(budget)}
              </Text>
            </View>
          </View>
          
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: item.color 
                }
              ]} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {limit && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {displayCategories.map((category) => (
        <View key={category.id}>
           {renderItem({ item: category })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  budgetAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default CategoryList;
