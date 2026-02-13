import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';
import { GLOBAL_BUDGET_CATEGORY_NAME } from '../../utils/budget';
import { formatCurrency } from '../../utils/formatting';
import { getIcon } from '../../utils/icons';
import BackButton from '../../components/BackButton';

const ManageBudgetScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { categories, budgets, loadCategories, loadBudgets, setBudget } = useExpenseStore();
  const { currency } = useSettingsStore();
  
  // Local state to handle inputs before saving
  const [globalAmount, setGlobalAmount] = useState('');
  const [categoryAmounts, setCategoryAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  useEffect(() => {
    // Sync local state with store data
    const globalBudget = budgets.find(b => b.category === GLOBAL_BUDGET_CATEGORY_NAME);
    if (globalBudget) {
      setGlobalAmount(globalBudget.amount.toString());
    }

    const newCategoryAmounts: Record<string, string> = {};
    categories.forEach(cat => {
      const budget = budgets.find(b => b.category === cat.name);
      if (budget) {
        newCategoryAmounts[cat.name] = budget.amount.toString();
      }
    });
    setCategoryAmounts(newCategoryAmounts);
  }, [budgets, categories]);

  const handleSetGlobalBudget = async () => {
    const amount = parseFloat(globalAmount);
    if (!isNaN(amount)) {
      await setBudget(GLOBAL_BUDGET_CATEGORY_NAME, amount);
    }
  };

  const handleSetCategoryBudget = async (categoryName: string, value: string) => {
    // Update local state first for responsiveness
    setCategoryAmounts(prev => ({ ...prev, [categoryName]: value }));
    
    // Save to store
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      await setBudget(categoryName, amount);
    } else if (value === '') {
      // Optional: Handle clearing budget? For now just ignore or set to 0
      // await setBudget(categoryName, 0); 
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.navHeader}>
        <BackButton />
        <Text style={[styles.navHeaderTitle, { color: colors.text }]}>Manage Budget</Text>
      </View>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={10}
      >
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Set your monthly spending limits
            </Text>
          </View>

        {/* Global Budget Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Total Monthly Budget</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Overall limit for all spending
          </Text>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.currencyPrefix, { color: colors.text }]}>{currency.symbol}</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={globalAmount}
              onChangeText={setGlobalAmount}
              onEndEditing={handleSetGlobalBudget}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Category Budgets Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Specific limits for each category
          </Text>

          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            return (
            <View key={category.id} style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
              <View style={styles.categoryInfo}>
                <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                  <Icon size={20} color={category.color} />
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </View>
              
              <View style={[styles.smallInputContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencyPrefix, { color: colors.text }]}>{currency.symbol}</Text>
                <TextInput
                  style={[styles.smallInput, { color: colors.text }]}
                  value={categoryAmounts[category.name] || ''}
                  onChangeText={(val) => {
                    setCategoryAmounts(prev => ({ ...prev, [category.name]: val }));
                  }}
                  onEndEditing={(e) => handleSetCategoryBudget(category.name, e.nativeEvent.text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
            );
          })}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  navHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    height: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  smallInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    width: 100,
  },
  smallInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
    textAlign: 'right',
  },
});

export default ManageBudgetScreen;