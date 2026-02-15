import React from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft} from 'lucide-react-native';
import { Colors } from '../constants/colors';

const BackButton = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity 
      onPress={() => navigation.goBack()} 
      style={styles.button}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ArrowLeft size={24} color={colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default BackButton;
