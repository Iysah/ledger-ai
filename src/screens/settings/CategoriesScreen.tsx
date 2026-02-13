import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2 } from 'lucide-react-native';
import { useExpenseStore } from '@/store/expenseStore';

const CategoryScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { categories, addCategory, deleteCategory } = useExpenseStore();

    const handleAddCategory = async () => {
      if (!newCategoryName.trim()) {
        Alert.alert('Error', 'Please enter a category name');
        return;
      }
      
      if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
        Alert.alert('Error', 'Category already exists');
        return;
      }
  
      try {
        await addCategory({
          name: newCategoryName.trim(),
          icon: selectedIcon,
          color: selectedColor
        });
        setActiveModal('categories'); // Go back to list
        resetForm();
      } catch (error) {
        Alert.alert('Error', 'Failed to add category');
      }
    };
  
    const handleDeleteCategory = (id: number, name: string) => {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteCategory(id);
              } catch (error) {
                toast.error('Error', {
                  description: 'Failed to delete category',
                });
              }
            }
          }
        ]
      );
    };
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.modalContent}>
             <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setActiveModal('addCategory')}
            >
              <Plus size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add New Category</Text>
            </TouchableOpacity>
            
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 20 }]}>
              {categories.map((category, index) => {
                const Icon = getIcon(category.icon);
                return (
                  <View key={category.id} style={[
                    styles.categoryItem,
                    index === categories.length - 1 && styles.lastItem,
                    { borderBottomColor: colors.border }
                  ]}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.iconBox, { backgroundColor: category.color + '20' }]}>
                        <Icon size={20} color={category.color} />
                      </View>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => handleDeleteCategory(category.id, category.name)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    marginTop: 8,
    fontSize: 16,
  },
   modalContent: {
    padding: 20,
  },
  
  // Category List Styles
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
});