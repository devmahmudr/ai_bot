"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpense = addExpense;
const db_1 = require("../db/");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
function addExpense(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        // 1. Xarajat nomini so'raymiz
        yield ctx.reply("Xarajat nomini kiriting (masalan, 'Non' yoki 'Avtobus'):");
        const nameCtx = yield conversation.wait();
        const expenseName = (_a = nameCtx.message) === null || _a === void 0 ? void 0 : _a.text;
        // 2. Summani so'raymiz
        yield ctx.reply("Summasini kiriting (faqat raqamda, masalan, 5000):");
        const amountCtx = yield conversation.waitFor('message:text');
        const expenseAmount = parseInt(amountCtx.message.text, 10);
        // 3. Kategoriyani so'raymiz
        yield ctx.reply("Kategoriyasini kiriting (masalan, 'Oziq-ovqat', 'Transport'):");
        const categoryCtx = yield conversation.wait();
        const expenseCategory = (_b = categoryCtx.message) === null || _b === void 0 ? void 0 : _b.text;
        const userId = (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id;
        // Kiritilgan ma'lumotlarni tekshiramiz
        if (!expenseName || isNaN(expenseAmount) || !expenseCategory || !userId) {
            yield ctx.reply("Ma'lumotlar noto'g'ri kiritildi. Iltimos, /add_expense buyrug'ini qaytadan boshlang.");
            return;
        }
        const expenseAmountInTiyin = expenseAmount * 100;
        // 4. Ma'lumotlarni bazaga saqlaymiz
        yield db_1.db.insert(schema_1.expenses).values({
            userId: userId,
            name: expenseName,
            amount: expenseAmountInTiyin, // Tiyinga o'tkazib saqlaymiz
            category: expenseCategory,
        });
        yield ctx.reply(`✅ "${expenseName}" xarajati muvaffaqiyatli qo'shildi!`);
        const MONTHLY_LIMIT = 2000000 * 100; // Misol uchun 2,000,000 so'm
        // 2. Joriy oyning birinchi va oxirgi kunini aniqlaymiz
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        // 3. Shu oy uchun jami xarajatlarni bazadan hisoblaymiz
        const [monthlyExpenseResult] = yield db_1.db.select({
            total: (0, drizzle_orm_1.sql) `sum(${schema_1.expenses.amount})`.mapWith(Number)
        }).from(schema_1.expenses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.expenses.userId, userId), (0, drizzle_orm_1.gte)(schema_1.expenses.createdAt, startDate), //createdAt >= startDate
        (0, drizzle_orm_1.lte)(schema_1.expenses.createdAt, endDate) //createdAt <= endDate
        ));
        const totalMonthlyExpense = (monthlyExpenseResult === null || monthlyExpenseResult === void 0 ? void 0 : monthlyExpenseResult.total) || 0;
        // 4. Limit oshganini tekshiramiz (eng aqlli usuli)
        // Faqatgina limit aynan SHU xarajatdan keyin oshgan bo'lsa xabar beramiz.
        // Bu foydalanuvchini har safar bezovta qilishning oldini oladi.
        const totalBeforeThisExpense = totalMonthlyExpense - expenseAmountInTiyin;
        if (totalMonthlyExpense > MONTHLY_LIMIT && totalBeforeThisExpense <= MONTHLY_LIMIT) {
            yield ctx.reply(`🔔 Ogohlantirish! Siz bu oy uchun belgilangan xarajat limitidan (${MONTHLY_LIMIT / 100} so'm) oshib ketdingiz.\n` +
                `Joriy oylik xarajatingiz: ${totalMonthlyExpense / 100} so'm.`);
        }
    });
}
