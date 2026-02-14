import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { toast } from 'sonner-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Trash2, 
  Plus, 
  X, 
  Check, 
  Moon, 
  Sun, 
  Monitor,
  ChevronRight,
  ChevronDown,
  Banknote,
  Calculator,
  List,
  PieChart,
  Palette,
  Star,
  Mail,
  Info,
  Share2,
  RefreshCw,
  LucideIcon
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore, SUPPORTED_CURRENCIES } from '../store/settingsStore';
import { getIcon, availableIcons } from '../utils/icons';

const COLORS_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#95A5A6',
  '#A9DFBF', '#F5B7B1', '#D7BDE2', '#AED6F1'
];

// --- Reusable Components ---

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  colors: typeof Colors.light;
  styles: any;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, colors, styles }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {children}
    </View>
  </View>
);

interface SettingsItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress: () => void;
  type?: 'link' | 'dropdown';
  isLast?: boolean;
  colors: typeof Colors.light;
  textColor?: string;
  styles: any;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  onPress, 
  type = 'link', 
  isLast = false, 
  colors,
  textColor,
  styles
}) => (
  <TouchableOpacity 
    style={[
      styles.itemContainer, 
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <Icon size={22} color={colors.text} strokeWidth={1.5} />
      <Text style={[styles.itemLabel, { color: textColor || colors.text }]}>{label}</Text>
    </View>
    
    <View style={styles.itemRight}>
      {value && <Text style={[styles.itemValue, { color: colors.textSecondary }]}>{value}</Text>}
      {type === 'dropdown' ? (
        <ChevronDown size={20} color={colors.textSecondary} />
      ) : (
        <ChevronRight size={20} color={colors.textSecondary} />
      )}
    </View>
  </TouchableOpacity>
);

// --- Main Screen ---

const SettingsScreen = () => {
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const { categories, addCategory, deleteCategory } = useExpenseStore();
  const { currency, setCurrency } = useSettingsStore();
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'none' | 'categories' | 'addCategory' | 'theme' | 'currency'>('none');
  
  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('other');
  const [selectedColor, setSelectedColor] = useState(COLORS_PALETTE[0]);
  
  // Theme state
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Error', {
        description: 'Please enter a category name',
      });
      return;
    }
    
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast.error('Error', {
        description: 'Category already exists',
      });
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
      toast.error('Error', {
        description: 'Failed to add category',
      });
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
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNewCategoryName('');
    setSelectedIcon('other');
    setSelectedColor(COLORS_PALETTE[0]);
  };

  const styles = createStyles(colors);
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Preferences Section */}
        <SettingsSection title="Preferences" colors={colors} styles={styles}>
          <SettingsItem 
            icon={Banknote} 
            label="Manage Currency" 
            value={`(${currency.symbol})`}
            type="dropdown"
            onPress={() => setActiveModal('currency')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={Calculator} 
            label="Manage Budget" 
            onPress={() => navigation.navigate('ManageBudget')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={List} 
            label="Manage Categories" 
            onPress={() => setActiveModal('categories')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={PieChart} 
            label="Category Budgets" 
            onPress={() => navigation.navigate('CategoryBudgets')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={Palette} 
            label="Select Theme" 
            onPress={() => setActiveModal('theme')} 
            colors={colors}
            styles={styles}
          />
        </SettingsSection>

        {/* Help & Support Section */}
        <SettingsSection title="Help & Support" colors={colors} styles={styles}>
          <SettingsItem 
            icon={Mail} 
            label="Contact Support" 
            onPress={() => Alert.alert('Contact Support', 'support@moniqa.app')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={Info} 
            label="About Monitrac" 
            onPress={() => navigation.navigate('About')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={Share2} 
            label="Share with friends" 
            onPress={() => toast.info('Share', {
              description: 'Sharing functionality coming soon!'
            })} 
            colors={colors}
            styles={styles}
          />
        </SettingsSection>
        
        <View style={styles.footer}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Categories Management Modal */}
      <Modal
        visible={activeModal === 'categories'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal('none')}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Manage Categories</Text>
            <TouchableOpacity onPress={() => setActiveModal('none')}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>

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
        </View>
      </Modal>

      {/* Add Category Modal (Nested) */}
      <Modal
        visible={activeModal === 'addCategory'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal('categories')}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setActiveModal('categories')}>
               <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Category</Text>
             <View style={{ width: 50 }} /> 
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Category Name"
                placeholderTextColor={colors.textSecondary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
              <View style={styles.iconGrid}>
                {availableIcons.map((iconName) => {
                  const Icon = getIcon(iconName);
                  const isSelected = selectedIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconOption,
                        { borderColor: colors.border, backgroundColor: colors.surface },
                        isSelected && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                      ]}
                      onPress={() => setSelectedIcon(iconName)}
                    >
                      <Icon 
                        size={24} 
                        color={isSelected ? colors.primary : colors.text} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Color</Text>
              <View style={styles.colorGrid}>
                {COLORS_PALETTE.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        isSelected && [styles.selectedColorOption, { borderColor: colors.text }]
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {isSelected && <Check size={16} color="#FFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleAddCategory}
            >
              <Text style={styles.saveButtonText}>Save Category</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
       <Modal
        visible={activeModal === 'theme'}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setActiveModal('none')}
        >
            <View style={[styles.centeredModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.centeredModalTitle, { color: colors.text }]}>Select Theme</Text>
                
                <TouchableOpacity 
                    style={[styles.themeRow, themeMode === 'light' && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => { setThemeMode('light'); setActiveModal('none'); }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Sun size={20} color={colors.text} />
                        <Text style={[styles.themeRowText, { color: colors.text }]}>Light</Text>
                    </View>
                    {themeMode === 'light' && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.themeRow, themeMode === 'dark' && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => { setThemeMode('dark'); setActiveModal('none'); }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Moon size={20} color={colors.text} />
                        <Text style={[styles.themeRowText, { color: colors.text }]}>Dark</Text>
                    </View>
                    {themeMode === 'dark' && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.themeRow, themeMode === 'system' && { backgroundColor: colors.primary + '20' }]}
                    onPress={() => { setThemeMode('system'); setActiveModal('none'); }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Monitor size={20} color={colors.text} />
                        <Text style={[styles.themeRowText, { color: colors.text }]}>System</Text>
                    </View>
                    {themeMode === 'system' && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={activeModal === 'currency'}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setActiveModal('none')}
        >
            <View style={[styles.centeredModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.centeredModalTitle, { color: colors.text }]}>Select Currency</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <TouchableOpacity 
                        key={curr.code}
                        style={[styles.themeRow, currency.code === curr.code && { backgroundColor: colors.primary + '20' }]}
                        onPress={() => { setCurrency(curr); setActiveModal('none'); }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Text style={{ fontSize: 20, width: 30, textAlign: 'center', color: colors.text }}>{curr.symbol}</Text>
                            <Text style={[styles.themeRowText, { color: colors.text }]}>{curr.name} ({curr.code})</Text>
                        </View>
                        {currency.code === curr.code && <Check size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
            </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    // borderBottomWidth: 1, // Removed to match clean look of reference, but kept in code commented out if needed
  },
  headerTitle: {
    fontSize: 34, // Larger title to match iOS/Reference style
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 12, // Slight indent for section title
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    // No border width for cleaner look on dark mode, or very subtle
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 16,
  },
  footer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
  },
  versionText: {
      fontSize: 14,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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

  // Form Styles
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Centered Modal (Theme)
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  centeredModal: {
      width: '80%',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
  },
  centeredModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
  },
  themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 4,
  },
  themeRowText: {
      fontSize: 16,
      fontWeight: '500',
  }
});

export default SettingsScreen;
