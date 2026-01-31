import { db } from './drizzle';
import { expenses, categories, messages, budgets } from './schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { PREDEFINED_CATEGORIES } from '../constants/categories';
import { Category, Expense, Budget } from '../types';

/**
 * Initialize the SQLite database and create tables
 */
export const initDatabase = async () => {
  try {
    // Ensure tables exist using raw SQL for simplicity in this migration phase
    // In a full Drizzle setup, we'd use migrations
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);
    
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        merchant TEXT,
        date TEXT NOT NULL,
        receipt_image_uri TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        embedding TEXT
      );
    `);

    await db.run(sql`
       CREATE TABLE IF NOT EXISTS messages (
         id TEXT PRIMARY KEY,
         text TEXT NOT NULL,
         sender TEXT NOT NULL,
         type TEXT NOT NULL,
         data TEXT,
         created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
       );
     `);

    // Check if we need to migrate existing tables (e.g. add columns)
    // This is a simplified migration check
    try {
      await db.run(sql`ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT 'other'`);
    } catch (e) { /* ignore if exists */ }

    try {
      await db.run(sql`ALTER TABLE categories ADD COLUMN color TEXT NOT NULL DEFAULT '#cccccc'`);
    } catch (e) { /* ignore if exists */ }

    try {
      await db.run(sql`ALTER TABLE expenses ADD COLUMN merchant TEXT`);
    } catch (e) { /* ignore if exists */ }
    
    try {
      await db.run(sql`ALTER TABLE expenses ADD COLUMN embedding TEXT`);
    } catch (e) { /* ignore if exists */ }

    await seedCategories();
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Seed predefined categories into the database
 */
const seedCategories = async (): Promise<void> => {
  try {
    for (const category of PREDEFINED_CATEGORIES) {
      const existing = await db.select().from(categories).where(eq(categories.name, category.name));

      if (existing.length === 0) {
        await db.insert(categories).values({
          name: category.name,
          icon: category.icon,
          color: category.color
        });
      } else {
        await db.update(categories)
          .set({ icon: category.icon, color: category.color })
          .where(eq(categories.name, category.name));
      }
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

/**
 * Seed initial budgets for demonstration
 */
const seedBudgets = async (): Promise<void> => {
  try {
    const foodBudget = await db.select().from(budgets).where(eq(budgets.category, 'Food'));
    if (foodBudget.length === 0) {
      await db.insert(budgets).values({
        category: 'Food',
        amount: 500, // Default $500 budget for Food
        period: 'monthly'
      });
    }
  } catch (error) {
    console.error('Error seeding budgets:', error);
  }
};

/**
 * Get all categories from the database
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const result = await db.select().from(categories).orderBy(categories.name);
    return result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Add a new category
 */
export const addCategory = async (category: Omit<Category, 'id'>): Promise<number> => {
  try {
    const result = await db.insert(categories).values(category).returning({ insertedId: categories.id });
    return result[0].insertedId;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Get all expenses from the database
 */
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const result = await db.select().from(expenses).orderBy(desc(expenses.date), desc(expenses.createdAt));
    return result as Expense[];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Add a new expense to the database
 */
export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  try {
    const result = await db.insert(expenses).values({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      merchant: expense.merchant,
      date: expense.date,
      receiptImageUri: expense.receipt_image_uri,
      embedding: expense.embedding,
    }).returning({ insertedId: expenses.id });
    return result[0].insertedId;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Update an existing expense
 */
export const updateExpense = async (id: number, expense: Partial<Omit<Expense, 'id' | 'created_at'>>): Promise<void> => {
  try {
    const updateData: any = {};
    if (expense.amount !== undefined) updateData.amount = expense.amount;
    if (expense.description !== undefined) updateData.description = expense.description;
    if (expense.category !== undefined) updateData.category = expense.category;
    if (expense.merchant !== undefined) updateData.merchant = expense.merchant;
    if (expense.date !== undefined) updateData.date = expense.date;
    if (expense.receipt_image_uri !== undefined) updateData.receiptImageUri = expense.receipt_image_uri;
    if (expense.embedding !== undefined) updateData.embedding = expense.embedding;
    
    updateData.updatedAt = sql`CURRENT_TIMESTAMP`;

    await db.update(expenses).set(updateData).where(eq(expenses.id, id));
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense from the database
 */
export const deleteExpense = async (id: number): Promise<void> => {
  try {
    await db.delete(expenses).where(eq(expenses.id, id));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Get expenses filtered by category and date range
 */
export const getFilteredExpenses = async (
  category: string | null,
  startDate: string | null,
  endDate: string | null
): Promise<Expense[]> => {
  try {
    const conditions = [];
    if (category) conditions.push(eq(expenses.category, category));
    if (startDate) conditions.push(gte(expenses.date, startDate));
    if (endDate) conditions.push(lte(expenses.date, endDate));

    const result = await db.select().from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date), desc(expenses.createdAt));
      
    return result as Expense[];
  } catch (error) {
    console.error('Error fetching filtered expenses:', error);
    throw error;
  }
};

/**
 * Get all messages
 */
export const getMessages = async (): Promise<any[]> => {
  try {
    const result = await db.select().from(messages).orderBy(messages.createdAt);
    return result.map(m => ({
        ...m,
        data: m.data ? JSON.parse(m.data) : undefined,
        // Drizzle might return sender as 'user' | 'ai' but typed as string, 
        // validation is handled by runtime or types in consumer
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Add a new message
 */
export const addMessage = async (message: { id: string, text: string, sender: string, type: string, data?: any }): Promise<void> => {
  try {
    await db.insert(messages).values({
      id: message.id,
      text: message.text,
      sender: message.sender,
      type: message.type,
      data: message.data ? JSON.stringify(message.data) : null,
    });
  } catch (error) {
    console.error('Error adding message:', error);
  }
};

/**
 * Get budget for a category
 */
export const getCategoryBudget = async (category: string): Promise<number | null> => {
  try {
    const result = await db.select().from(budgets).where(eq(budgets.category, category));
    return result.length > 0 ? result[0].amount : null;
  } catch (error) {
    console.error('Error fetching budget:', error);
    return null;
  }
};

/**
 * Set budget for a category
 */
export const setCategoryBudget = async (category: string, amount: number): Promise<void> => {
  try {
    const existing = await db.select().from(budgets).where(eq(budgets.category, category));
    if (existing.length > 0) {
      await db.update(budgets)
        .set({ amount, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(budgets.category, category));
    } else {
      await db.insert(budgets).values({ category, amount });
    }
  } catch (error) {
    console.error('Error setting budget:', error);
    throw error;
  }
};

/**
 * Get total spend for a category in the current month
 */
export const getMonthlyCategorySpend = async (category: string): Promise<number> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const result = await db.select({
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.category, category),
        gte(expenses.date, startOfMonth),
        lte(expenses.date, endOfMonth)
      )
    );

    return result[0]?.total || 0;
  } catch (error) {
    console.error('Error calculating monthly spend:', error);
    return 0;
  }
};

/**
 * Get all budgets
 */
export const getAllBudgets = async (): Promise<Budget[]> => {
  try {
    const result = await db.select().from(budgets);
    return result as Budget[];
  } catch (error) {
    console.error('Error fetching all budgets:', error);
    return [];
  }
};

/**
 * Get total spend for all categories in the current month
 */
export const getAllCategorySpends = async (): Promise<Record<string, number>> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const result = await db.select({
      category: expenses.category,
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.date, startOfMonth),
        lte(expenses.date, endOfMonth)
      )
    )
    .groupBy(expenses.category);

    const spends: Record<string, number> = {};
    result.forEach(r => {
      spends[r.category] = r.total || 0;
    });
    return spends;
  } catch (error) {
    console.error('Error calculating all monthly spends:', error);
    return {};
  }
};
