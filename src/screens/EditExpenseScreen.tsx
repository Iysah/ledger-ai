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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore } from '../store/settingsStore';
import CategoryPicker from '../components/CategoryPicker';
import { Expense } from '../types';
import { formatDateISO } from '../utils/formatting';

type RootStackParamList = {
  EditExpense: { expense: Expense };
};

type EditExpenseRouteProp = RouteProp<RootStackParamList, 'EditExpense'>;

/**
 * Edit Expense Screen - similar to Add Expense but pre-filled
 */
const EditExpenseScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const route = useRoute<EditExpenseRouteProp>();
  const navigation = useNavigation();
  const { updateExpense, loadCategories, categories } = useExpenseStore();
  const { currency } = useSettingsStore();

  const expense = route.params.expense;

  const [formData, setFormData] = useState({
    amount: expense.amount.toString(),
    description: expense.description,
    category: expense.category,
    date: new Date(expense.date),
    receipt_image_uri: expense.receipt_image_uri,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAmountChange = (text: string) => {
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
      await updateExpense(expense.id, {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formatDateISO(formData.date),
        receipt_image_uri: formData.receipt_image_uri,
      });

      Alert.alert('Success', 'Expense updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.chatContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <CategoryPicker
            selectedCategory={formData.category}
            onSelectCategory={handleCategorySelect}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

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
                <ImageIcon size={24} color={colors.text} style={{ marginBottom: 4 }} />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleTakePhoto}
              >
                <Camera size={24} color={colors.text} style={{ marginBottom: 4 }} />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Updating...' : 'Update Expense'}
          </Text>
        </TouchableOpacity>
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
    dateButton: {
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

export default EditExpenseScreen;

