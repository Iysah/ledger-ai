import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import ExpenseCard from '../components/ExpenseCard';
import { Expense } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getIcon } from '../utils/icons';

type RootStackParamList = {
  MainTabs: undefined;
  EditExpense: { expense: Expense };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Main expense list screen with filtering and swipe actions
 */
const ExpenseListScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();

  const {
    filteredExpenses,
    categories,
    isLoading,
    loadExpenses,
    loadCategories,
    deleteExpense,
    filterExpenses,
    clearFilters,
    filterOptions,
  } = useExpenseStore();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    filterOptions.category
  );

  useEffect(() => {
    // Initialize database and load data
    const initialize = async () => {
      await loadCategories();
      await loadExpenses();
    };
    initialize();
  }, []);

  const handleRefresh = async () => {
    await loadExpenses();
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ]
    );
  };

  const handleEdit = (expense: Expense) => {
    navigation.navigate('EditExpense', { expense });
  };

  const handleApplyFilters = async () => {
    await filterExpenses({
      category: selectedCategory,
      startDate: null, // Date range filtering can be added later
      endDate: null,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    clearFilters();
    setShowFilters(false);
  };

  const renderSwipeActions = (expense: Expense) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeButton, styles.editButton]}
          onPress={() => handleEdit(expense)}
        >
          <Text style={styles.swipeButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeButton, styles.deleteButton]}
          onPress={() => handleDelete(expense)}
        >
          <Text style={styles.swipeButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderExpense = ({ item }: { item: Expense }) => {
    return (
      <Swipeable renderRightActions={() => renderSwipeActions(item)}>
        <ExpenseCard
          expense={item}
          onPress={() => handleEdit(item)}
        />
      </Swipeable>
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterToggleText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={styles.emptySubtext}>
              Add your first expense to get started
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.dragHandle} />
              <Text style={styles.filterTitle}>Filter by Category</Text>
            </View>
            <View style={styles.categoryFilter}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategory === null && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === null && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const Icon = getIcon(cat.icon);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.filterChip,
                      selectedCategory === cat.name && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon 
                        size={14} 
                        color={selectedCategory === cat.name ? '#FFFFFF' : colors.text} 
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedCategory === cat.name && styles.filterChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterButton, styles.clearButton]}
                onPress={handleClearFilters}
              >
                <Text style={styles.filterButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, styles.applyButton]}
                onPress={handleApplyFilters}
              >
                <Text style={[styles.filterButtonText, styles.applyButtonText]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    filterToggle: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    filterToggleText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    categoryFilter: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.text,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    filterActions: {
      flexDirection: 'row',
      gap: 12,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    clearButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    applyButtonText: {
      color: '#FFFFFF',
    },
    listContent: {
      paddingVertical: 8,
    },
    swipeActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      marginRight: 16,
    },
    swipeButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
      borderRadius: 12,
    },
    editButton: {
      backgroundColor: colors.primary,
      marginRight: 8,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    swipeButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
      // We can't use a background color here with animationType="slide" 
      // because it will slide up. We keep it transparent.
    },
    bottomSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    },
    bottomSheetHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: 12,
    },
  });

export default ExpenseListScreen;

