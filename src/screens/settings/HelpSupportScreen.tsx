import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  useColorScheme,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Mail, 
  MessageCircle, 
  Globe, 
  Briefcase, 
  Users,
  ChevronRight,
  LucideIcon
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import BackButton from '../../components/BackButton';

// --- Reusable Settings Item Component (Local) ---
interface SettingsItemProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  colors: typeof Colors.light;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon: Icon, 
  label, 
  onPress, 
  isLast = false, 
  colors
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
      <Icon size={18} color={colors.text} strokeWidth={1.5} />
      <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
    </View>
    
    <View style={styles.itemRight}>
      <ChevronRight size={20} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const HelpSupportScreen = () => {
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? Colors.dark : Colors.light;

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while trying to open the link.');
    }
  };

  const supportOptions = [
    {
      label: 'Email',
      icon: Mail,
      action: () => handleOpenLink('mailto:support@monitrac.app')
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      action: () => handleOpenLink('https://wa.me/1234567890') // Placeholder
    },
    {
      label: 'Twitter',
      icon: Globe,
      action: () => handleOpenLink('https://twitter.com/monitrac') // Placeholder
    },
    {
      label: 'LinkedIn',
      icon: Briefcase,
      action: () => handleOpenLink('https://linkedin.com/company/monitrac') // Placeholder
    },
    {
      label: 'Join Community',
      icon: Users,
      action: () => handleOpenLink('https://discord.gg/monitrac') // Placeholder
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header]}>
        <View style={[styles.headerLeft, { backgroundColor: colors.surface }]}>
            <BackButton />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface, marginBottom: 16 }]}>
          {supportOptions.map((option, index) => (
            <SettingsItem 
              key={option.label}
              icon={option.icon}
              label={option.label}
              onPress={option.action}
              isLast={index === supportOptions.length - 1}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
    textAlign: 'center',
    // flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
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
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato-Regular',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default HelpSupportScreen;
