import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import CategoryPicker from '../components/CategoryPicker';
import { ExpenseFormData } from '../types';
import { formatDateISO } from '../utils/formatting';

/**
 * Add Expense Screen with chat-like UI
 */
const AddExpenseScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { addExpense, loadCategories, categories } = useExpenseStore();

  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    category: '',
    date: new Date(),
    receipt_image_uri: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
    if (categories.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories.length]);

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
      setFormData((prev) => ({ ...prev, amount: cleaned }));
    }
  };

  const handleDescriptionChange = (text: string) => {
    setFormData((prev) => ({ ...prev, description: text }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to attach receipts.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData((prev) => ({
          ...prev,
          receipt_image_uri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData((prev) => ({
          ...prev,
          receipt_image_uri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, receipt_image_uri: null }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description');
      return;
    }

    if (!formData.category) {
      Alert.alert('Missing Category', 'Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      await addExpense({
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formatDateISO(formData.date),
        receipt_image_uri: formData.receipt_image_uri,
      });

      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: categories[0]?.name || '',
        date: new Date(),
        receipt_image_uri: null,
      });

      Alert.alert('Success', 'Expense added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Chat-like UI Container */}
      <View style={styles.chatContainer}>
        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={formData.amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={formData.description}
            onChangeText={handleDescriptionChange}
            placeholder="What did you spend on?"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <CategoryPicker
            selectedCategory={formData.category}
            onSelectCategory={handleCategorySelect}
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              </View>
            )}
          </View>
        </View>

        {/* Receipt Image */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Receipt (Optional)</Text>
          {formData.receipt_image_uri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: formData.receipt_image_uri }}
                style={styles.receiptImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Text style={styles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handlePickImage}
              >
                <Text style={styles.imageButtonText}>📷 Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleTakePhoto}
              >
                <Text style={styles.imageButtonText}>📸 Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    chatContainer: {
      gap: 24,
    },
    inputGroup: {
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    currencySymbol: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: 16,
    },
    descriptionInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dateButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
    },
    datePickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageContainer: {
      alignItems: 'center',
    },
    receiptImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
      resizeMode: 'cover',
    },
    removeImageButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.error,
    },
    removeImageText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    imageButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    imageButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      alignItems: 'center',
    },
    imageButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });

export default AddExpenseScreen;

