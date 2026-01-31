import { db } from './drizzle';
import { expenses, categories } from './schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { PREDEFINED_CATEGORIES } from '../constants/categories';
import { Category, Expense } from '../types';

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

    // Check if we need to migrate existing tables (e.g. add columns)
    // This is a simplified migration check
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
