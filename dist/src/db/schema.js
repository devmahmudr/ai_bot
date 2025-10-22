"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomes = exports.expenses = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Xarajatlar jadvali
exports.expenses = (0, pg_core_1.pgTable)('expenses', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.bigint)('user_id', { mode: 'number' }).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull(), // Summani tiyinda saqlaymiz (masalan: 1000 so'm = 100000 tiyin)
    category: (0, pg_core_1.text)('category').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Daromadlar jadvali
exports.incomes = (0, pg_core_1.pgTable)('incomes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.bigint)('user_id', { mode: 'number' }).notNull(),
    source: (0, pg_core_1.text)('source').notNull(),
    amount: (0, pg_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
