import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  CreditCard, 
  HeartPulse, 
  BookOpen, 
  Package, 
  Coffee, 
  Briefcase, 
  Home, 
  Smartphone, 
  Plane, 
  Gift, 
  Music, 
  Dumbbell, 
  Wrench,
  HelpCircle,
  LucideProps
} from 'lucide-react-native';

export type IconName = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'entertainment' 
  | 'bills' 
  | 'health' 
  | 'education' 
  | 'other'
  | 'coffee'
  | 'work'
  | 'housing'
  | 'electronics'
  | 'travel'
  | 'gift'
  | 'music'
  | 'fitness'
  | 'maintenance';

export const iconMap: Record<string, React.FC<LucideProps>> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  bills: CreditCard,
  health: HeartPulse,
  education: BookOpen,
  other: Package,
  coffee: Coffee,
  work: Briefcase,
  housing: Home,
  electronics: Smartphone,
  travel: Plane,
  gift: Gift,
  music: Music,
  fitness: Dumbbell,
  maintenance: Wrench,
};

export const getIcon = (name: string) => {
  return iconMap[name] || HelpCircle;
};

export const availableIcons = Object.keys(iconMap);
