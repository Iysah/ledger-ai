import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Wallet, BarChart3, Lock, LucideIcon } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { setHasSeenOnboarding } from '../utils/storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const SLIDES: { id: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: '1',
    title: 'Track Expenses',
    description: 'Keep track of where your money goes with ease.',
    icon: Wallet,
  },
  {
    id: '2',
    title: 'Analyze Spending',
    description: 'Visual reports to help you understand your habits.',
    icon: BarChart3,
  },
  {
    id: '3',
    title: 'Secure & Private',
    description: 'Your data stays locally on your device.',
    icon: Lock,
  },
];

const OnboardingScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setHasSeenOnboarding();
    // Navigate to MainTabs and reset history so user can't go back to Onboarding
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    const Icon = item.icon;
    return (
      <View style={[styles.slide, { width }]}>
        <Icon size={120} color={Colors.light.primary} style={{ marginBottom: 24 }} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={32}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleSkip} style={styles.button}>
                <Text style={styles.buttonTextSecondary}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.primaryButton}>
                <Text style={styles.buttonTextPrimary}>Next</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleNext} style={[styles.primaryButton, styles.fullWidthButton]}>
              <Text style={styles.buttonTextPrimary}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.light.primary,
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  fullWidthButton: {
    flex: 1,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: Colors.light.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingScreen;
