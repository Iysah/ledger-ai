import { create } from 'zustand';
import { Expense, Category, FilterOptions, Budget } from '../types';
import * as db from '../database/db';

interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  categorySpends: Record<string, number>;
  filteredExpenses: Expense[];
  isLoading: boolean;
  error: string | null;
  filterOptions: FilterOptions;

  // Actions
  loadExpenses: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  setBudget: (category: string, amount: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExpense: (id: number, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  filterExpenses: (options: FilterOptions) => Promise<void>;
  clearFilters: () => void;
  setError: (error: string | null) => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  categories: [],
  budgets: [],
  categorySpends: {},
  filteredExpenses: [],
  isLoading: false,
  error: null,
  filterOptions: {
    category: null,
    startDate: null,
    endDate: null,
  },

  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await db.getExpenses();
      set({ expenses, filteredExpenses: expenses, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load expenses';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadBudgets: async () => {
    // Don't set global loading here to avoid flickering if expenses load fast
    try {
      const [budgets, categorySpends] = await Promise.all([
        db.getAllBudgets(),
        db.getAllCategorySpends()
      ]);
      set({ budgets, categorySpends });
    } catch (error) {
      console.error('Failed to load budgets', error);
      // Fail silently for budgets as it's secondary data
    }
  },

  loadCategories: async () => {
    try {
      const categories = await db.getCategories();
      set({ categories });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      set({ error: errorMessage });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      await db.addCategory(category);
      await get().loadCategories();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add category';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteCategory(id);
      await get().loadCategories();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setBudget: async (category, amount) => {
    // We don't set global loading here to keep UI responsive
    try {
      await db.setCategoryBudget(category, amount);
      await get().loadBudgets();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set budget';
      set({ error: errorMessage });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      await db.addExpense(expense);
      // Reload expenses after adding
      await get().loadExpenses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add expense';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateExpense: async (id, expense) => {
    set({ isLoading: true, error: null });
    try {
      await db.updateExpense(id, expense);
      // Reload expenses after updating
      await get().loadExpenses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update expense';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteExpense(id);
      // Reload expenses after deleting
      await get().loadExpenses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
      set({ error: errorMessage, isLoading: false });
    }
  },

  filterExpenses: async (options) => {
    set({ isLoading: true, error: null, filterOptions: options });
    try {
      const filtered = await db.getFilteredExpenses(
        options.category || null,
        options.startDate ? options.startDate.toISOString().split('T')[0] : null,
        options.endDate ? options.endDate.toISOString().split('T')[0] : null
      );
      set({ filteredExpenses: filtered, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to filter expenses';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearFilters: () => {
    set({
      filterOptions: {
        category: null,
        startDate: null,
        endDate: null,
      },
      filteredExpenses: get().expenses,
    });
  },

  setError: (error) => {
    set({ error });
  },
}));

