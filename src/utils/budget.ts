import { Budget } from '../types';

export const GLOBAL_BUDGET_CATEGORY_NAME = 'GLOBAL_MONTHLY_BUDGET';

export const calculateBudgetOverview = (budgets: Budget[], categorySpends: Record<string, number>) => {
  const globalBudget = budgets.find(b => b.category === GLOBAL_BUDGET_CATEGORY_NAME);
  const categoryBudgetsSum = budgets
    .filter(b => b.category !== GLOBAL_BUDGET_CATEGORY_NAME)
    .reduce((sum, b) => sum + b.amount, 0);

  // Use global budget if set, otherwise fallback to sum of category budgets
  const totalBudget = globalBudget ? globalBudget.amount : categoryBudgetsSum;
  
  const totalSpent = Object.values(categorySpends).reduce((sum, val) => sum + val, 0);
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  
  return {
    totalBudget,
    totalSpent,
    remaining,
    percentage
  };
};

export const getBudgetStatusColor = (percentage: number) => {
  if (percentage > 85) return '#F44336'; // Red
  if (percentage > 60) return '#FFC107'; // Yellow
  return '#4CAF50'; // Green
};
