import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, useColorScheme, FlatList, TouchableOpacity, 
  Modal, TextInput, Alert, StatusBar, Platform 
} from 'react-native';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { Plus, Trash2, DollarSign, ArrowRight, X } from 'lucide-react-native';
import { formatCurrency } from '../utils/formatting';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INCOME_TYPES = ['Salary', 'Freelance', 'Gifts', 'Dividends', 'Other'];

const BudgetScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const navigation = useNavigation<any>();
  const { incomes, loadIncomes, addIncome, deleteIncome } = useExpenseStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedType, setSelectedType] = useState(INCOME_TYPES[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadIncomes();
  }, []);

  const handleAddIncome = async () => {
    if (!amount) return;
    
    await addIncome({
      amount: parseFloat(amount),
      type: selectedType,
      description: description || selectedType,
      date: new Date().toISOString(),
    });
    
    setModalVisible(false);
    setAmount('');
    setDescription('');
    setSelectedType(INCOME_TYPES[0]);
  };

  const handleDeleteIncome = (id: number) => {
    Alert.alert(
      "Delete Income",
      "Are you sure you want to remove this income?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteIncome(id) }
      ]
    );
  };

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.incomeItem, { backgroundColor: colors.surface }]}>
      <View style={styles.incomeLeft}>
        <View style={[styles.incomeIcon, { backgroundColor: colors.primary + '20' }]}>
          <DollarSign size={20} color={colors.primary} />
        </View>
        <View style={styles.incomeDetails}>
          <Text style={[styles.incomeType, { color: colors.text }]}>{item.type}</Text>
          <Text style={[styles.incomeDate, { color: colors.textSecondary }]}>
            {format(new Date(item.date), 'MMM d, yyyy')}
          </Text>
        </View>
      </View>
      <View style={styles.incomeRight}>
        <Text style={[styles.incomeAmount, { color: colors.success }]}>
          +{formatCurrency(item.amount)}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteIncome(item.id)} style={styles.deleteButton}>
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Budget</Text>
      </View>

      <View style={styles.content}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.summaryLabel}>Total Monthly Income</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.summaryIcon}>
            <DollarSign size={32} color="#fff" />
          </View>
        </View>

        {/* Manage Limits Button */}
        <TouchableOpacity 
          style={[styles.manageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ManageBudget')}
        >
          <View style={styles.manageButtonContent}>
            <Text style={[styles.manageButtonTitle, { color: colors.text }]}>Spending Limits</Text>
            <Text style={[styles.manageButtonSubtitle, { color: colors.textSecondary }]}>
              Set budgets for categories
            </Text>
          </View>
          <ArrowRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Income List Header */}
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income Sources</Text>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)} 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Income</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={incomes}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No income added yet.
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Add your expected income to track your budget.
              </Text>
            </View>
          }
        />
      </View>

      {/* Add Income Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Income</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.text }]}>$</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
              <View style={styles.typeContainer}>
                {INCOME_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      selectedType === type 
                        ? { backgroundColor: colors.primary, borderColor: colors.primary } 
                        : { backgroundColor: colors.surface, borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text style={[
                      styles.typeText,
                      selectedType === type ? { color: '#fff' } : { color: colors.text }
                    ]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description (Optional)</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. October Salary"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { backgroundColor: amount ? colors.primary : colors.border }
              ]} 
              onPress={handleAddIncome}
              disabled={!amount}
            >
              <Text style={styles.saveButtonText}>Save Income</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  summaryIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  manageButtonContent: {
    flex: 1,
  },
  manageButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  manageButtonSubtitle: {
    fontSize: 13,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  incomeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  incomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  incomeIcon: {
    padding: 10,
    borderRadius: 12,
  },
  incomeDetails: {
    gap: 4,
  },
  incomeType: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeDate: {
    fontSize: 12,
  },
  incomeRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetScreen;
