import { serial, text, bigint, integer, timestamp, pgTable } from 'drizzle-orm/pg-core';

// Xarajatlar jadvali
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  name: text('name').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),// Summani tiyinda saqlaymiz (masalan: 1000 so'm = 100000 tiyin)
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daromadlar jadvali
export const incomes = pgTable('incomes', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  source: text('source').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});