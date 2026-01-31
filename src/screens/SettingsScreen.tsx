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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
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
import { toast } from 'sonner-native';

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
  const [activeModal, setActiveModal] = useState<'none' | 'theme' | 'currency'>('none');
  
  // Theme state
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

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
            onPress={() => navigation.navigate('ManageCategories')} 
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
            onPress={() => Alert.alert('Contact Support', 'support@fintrac.app')} 
            colors={colors}
            styles={styles}
          />
          <SettingsItem 
            icon={Info} 
            label="About Fintrac" 
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
