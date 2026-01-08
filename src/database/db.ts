import * as SQLite from 'expo-sqlite';
import { Expense, Category } from '../types';
import { PREDEFINED_CATEGORIES } from '../constants/categories';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database and create tables
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('ledger.db');
    
    // Create categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        emoji TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Create expenses table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        receipt_image_uri TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Seed categories if they don't exist
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
  if (!db) return;

  try {
    for (const category of PREDEFINED_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (name, emoji, color) VALUES (?, ?, ?)`,
        [category.name, category.emoji, category.color]
      );
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
  if (!db) {
    db = await initDatabase();
  }

  try {
    const result = await db.getAllAsync<Category>(
      'SELECT * FROM categories ORDER BY name',
      []
    );
    return result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get all expenses from the database
 */
export const getExpenses = async (): Promise<Expense[]> => {
  if (!db) {
    db = await initDatabase();
  }

  try {
    const result = await db.getAllAsync<Expense>(
      'SELECT * FROM expenses ORDER BY date DESC, created_at DESC',
      []
    );
    return result;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Add a new expense to the database
 */
export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  if (!db) {
    db = await initDatabase();
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO expenses (amount, description, category, date, receipt_image_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        expense.amount,
        expense.description,
        expense.category,
        expense.date,
        expense.receipt_image_uri || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Update an existing expense
 */
export const updateExpense = async (id: number, expense: Partial<Omit<Expense, 'id' | 'created_at'>>): Promise<void> => {
  if (!db) {
    db = await initDatabase();
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (expense.amount !== undefined) {
      updates.push('amount = ?');
      values.push(expense.amount);
    }
    if (expense.description !== undefined) {
      updates.push('description = ?');
      values.push(expense.description);
    }
    if (expense.category !== undefined) {
      updates.push('category = ?');
      values.push(expense.category);
    }
    if (expense.date !== undefined) {
      updates.push('date = ?');
      values.push(expense.date);
    }
    if (expense.receipt_image_uri !== undefined) {
      updates.push('receipt_image_uri = ?');
      values.push(expense.receipt_image_uri);
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    await db.runAsync(
      `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense from the database
 */
export const deleteExpense = async (id: number): Promise<void> => {
  if (!db) {
    db = await initDatabase();
  }

  try {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
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
  if (!db) {
    db = await initDatabase();
  }

  try {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const result = await db.getAllAsync<Expense>(query, params);
    return result;
  } catch (error) {
    console.error('Error fetching filtered expenses:', error);
    throw error;
  }
};

