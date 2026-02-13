import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  merchant: text('merchant'),
  date: text('date').notNull(),
  receiptImageUri: text('receipt_image_uri'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  // Store embedding as a JSON string of number[]
  embedding: text('embedding'),
});

export const budgets = sqliteTable('budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull().unique(),
  amount: real('amount').notNull(),
  period: text('period').notNull().default('monthly'),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
});

export const incomes = sqliteTable('incomes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  sender: text('sender').notNull(), // 'user' | 'ai'
  type: text('type').notNull(), // 'text' | 'transaction' | 'error' | 'message'
  data: text('data'), // JSON stringified
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
