import { Category } from '../types';

export const PREDEFINED_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', icon: 'food', color: '#FF6B6B' },
  { name: 'Transport', icon: 'transport', color: '#4ECDC4' },
  { name: 'Shopping', icon: 'shopping', color: '#45B7D1' },
  { name: 'Entertainment', icon: 'entertainment', color: '#FFA07A' },
  { name: 'Bills', icon: 'bills', color: '#98D8C8' },
  { name: 'Healthcare', icon: 'health', color: '#F7DC6F' },
  { name: 'Education', icon: 'education', color: '#BB8FCE' },
  { name: 'Other', icon: 'other', color: '#95A5A6' },
];
