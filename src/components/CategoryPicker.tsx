import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { Category } from '../types';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { getIcon } from '../utils/icons';

interface CategoryPickerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

/**
 * Category picker component with predefined categories
 */
const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { categories } = useExpenseStore();

  const styles = createStyles(colors);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        const isSelected = selectedCategory === category.name;
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              isSelected && styles.selectedCategory,
              { borderColor: category.color },
            ]}
            onPress={() => onSelectCategory(category.name)}
          >
            <View style={styles.iconContainer}>
              <Icon 
                size={20} 
                color={isSelected ? colors.primary : category.color} 
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                isSelected && styles.selectedText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 2,
      backgroundColor: colors.surface,
      marginRight: 8,
    },
    selectedCategory: {
      backgroundColor: colors.primary + '20',
    },
    iconContainer: {
      marginRight: 6,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    selectedText: {
      fontWeight: '700',
      color: colors.primary,
    },
  });

export default CategoryPicker;
