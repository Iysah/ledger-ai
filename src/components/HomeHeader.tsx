import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { format } from 'date-fns';

const HomeHeader = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const navigation = useNavigation<any>();
  
  const today = new Date();
  const dayName = format(today, 'EEEE');
  const dateString = format(today, 'MMM d, yyyy');

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View>
        <Text style={[styles.dayText, { color: colors.text }]}>{dayName}</Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{dateString}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.profileButton, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <User size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dayText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HomeHeader;
