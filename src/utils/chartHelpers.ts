import { Expense, Category } from '../types';
import { Colors } from '../constants/colors';

export interface PieChartData {
  value: number;
  color: string;
  text?: string;
  shiftTextX?: number;
  shiftTextY?: number;
}

export interface BarChartData {
  value: number;
  label: string;
  frontColor: string;
  topLabelComponent?: () => any;
}

export interface MerchantData {
  name: string;
  amount: number;
  count: number;
}

const DEFAULT_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#95A5A6',
  '#A9DFBF', '#F5B7B1', '#D7BDE2', '#AED6F1'
];

/**
 * Prepares data for the Pie/Donut chart grouped by category
 */
export const preparePieChartData = (
  expenses: Expense[], 
  categories: Category[]
): PieChartData[] => {
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return Object.entries(categoryTotals)
    .map(([categoryName, total], index) => {
      const category = categories.find(c => c.name === categoryName);
      const color = category?.color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
      const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
      
      return {
        value: total,
        color: color,
        text: percentage > 5 ? `${percentage.toFixed(0)}%` : '', // Only show text if > 5%
        shiftTextX: 0,
        shiftTextY: 0,
        // Custom properties for legend
        category: categoryName,
        percentage: percentage
      };
    })
    .sort((a, b) => b.value - a.value);
};

/**
 * Prepares data for the Bar chart showing daily spending trends
 */
export const prepareBarChartData = (
  expenses: Expense[],
  primaryColor: string
): BarChartData[] => {
  const dailyTotals: Record<number, number> = {};
  
  // Get days in current month based on expenses (assuming expenses are filtered for a specific month)
  // If expenses array is empty, we can't determine the month easily, so we handle that case.
  if (expenses.length === 0) return [];

  const firstDate = new Date(expenses[0].date);
  const daysInMonth = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0).getDate();

  // Initialize all days with 0
  for (let i = 1; i <= daysInMonth; i++) {
    dailyTotals[i] = 0;
  }

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const day = date.getDate();
    if (dailyTotals[day] !== undefined) {
      dailyTotals[day] += expense.amount;
    }
  });

  return Object.entries(dailyTotals).map(([day, total]) => ({
    value: total,
    label: day,
    frontColor: primaryColor,
  }));
};

/**
 * Prepares top merchants data
 */
export const prepareTopMerchantsData = (expenses: Expense[]): MerchantData[] => {
  const merchantTotals: Record<string, { amount: number; count: number }> = {};

  expenses.forEach(expense => {
    const name = expense.merchant || 'Unknown';
    if (!merchantTotals[name]) {
      merchantTotals[name] = { amount: 0, count: 0 };
    }
    merchantTotals[name].amount += expense.amount;
    merchantTotals[name].count += 1;
  });

  return Object.entries(merchantTotals)
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5
};
