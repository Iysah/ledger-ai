import { calculateBudgetOverview, getBudgetStatusColor } from '../budget';

describe('Budget Calculations', () => {
  const mockBudgets = [
    { id: 1, category: 'Food', amount: 500, period: 'monthly' },
    { id: 2, category: 'Transport', amount: 300, period: 'monthly' },
  ];

  const mockSpends = {
    'Food': 250,
    'Transport': 50,
    'Entertainment': 100, // Unbudgeted spend
  };

  test('calculateBudgetOverview calculates totals correctly', () => {
    const result = calculateBudgetOverview(mockBudgets, mockSpends);
    
    expect(result.totalBudget).toBe(800); // 500 + 300
    expect(result.totalSpent).toBe(400); // 250 + 50 + 100
    expect(result.remaining).toBe(400); // 800 - 400
    expect(result.percentage).toBe(50); // 400 / 800 * 100
  });

  test('calculateBudgetOverview handles zero budget', () => {
    const result = calculateBudgetOverview([], mockSpends);
    
    expect(result.totalBudget).toBe(0);
    expect(result.totalSpent).toBe(400);
    expect(result.remaining).toBe(-400);
    expect(result.percentage).toBe(0); // Should be 0 if budget is 0
  });

  test('calculateBudgetOverview caps percentage at 100', () => {
    const overSpends = { ...mockSpends, 'Food': 1000 };
    const result = calculateBudgetOverview(mockBudgets, overSpends);
    
    expect(result.percentage).toBe(100);
  });

  test('getBudgetStatusColor returns correct colors', () => {
    expect(getBudgetStatusColor(50)).toBe('#4CAF50'); // Green
    expect(getBudgetStatusColor(70)).toBe('#FFC107'); // Yellow
    expect(getBudgetStatusColor(90)).toBe('#F44336'); // Red
  });
});
