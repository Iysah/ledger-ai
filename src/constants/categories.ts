import { Category } from '../types';

export const PREDEFINED_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', emoji: '🍔', color: '#FF6B6B' },
  { name: 'Transport', emoji: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', emoji: '🛍️', color: '#45B7D1' },
  { name: 'Entertainment', emoji: '🎬', color: '#FFA07A' },
  { name: 'Bills', emoji: '💳', color: '#98D8C8' },
  { name: 'Healthcare', emoji: '🏥', color: '#F7DC6F' },
  { name: 'Education', emoji: '📚', color: '#BB8FCE' },
  { name: 'Other', emoji: '📦', color: '#95A5A6' },
];

