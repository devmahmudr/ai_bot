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
require("dotenv/config");
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
const addExpense_1 = require("./conversations/addExpense");
const env_config_1 = require("./configs/env.config");
const addIncome_1 = require("./conversations/addIncome");
const schema_1 = require("./db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
// Bot yaratishda yangi MyContext tipini ko'rsatamiz
const bot = new grammy_1.Bot(env_config_1.configs.BOT_TOKEN);
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield bot.api.setMyCommands([
        { command: "start", description: "Start the bot" },
        { command: "add_income", description: "Daromad qo'shish" },
        { command: "add_expense", description: "Xarajat qo'shish" },
        { command: "balance", description: "Balansni aniqlash" },
        { command: "report", description: "Hisobotni ko'rish" },
    ]);
}))();
// Kerakli "middleware"larni o'rnatish
bot.use((0, grammy_1.session)({
    initial: () => ({}), // Sessiyani boshlang'ich qiymati
}));
bot.use((0, conversations_1.conversations)());
// Suhbatlarni ro'yxatdan o'tkazish
// Endi bu yerda xatolik bo'lmaydi, chunki bot ham, suhbat ham MyContext'ni ishlatadi
bot.use((0, conversations_1.createConversation)(addExpense_1.addExpense));
bot.use((0, conversations_1.createConversation)(addIncome_1.addIncome));
// "/start" buyrug'iga javob
bot.command('start', (ctx) => {
    ctx.reply("Assalomu alaykum! Shaxsiy moliya hisob-kitob botiga xush kelibsiz!\n\nBuyruqlar:\n/add_expense - Xarajat qo'shish\n/add_income - Daromad qo'shish\n/balance - Balansni ko'rish\n/report - Hisobot olish");
});
// Buyruqlarni suhbatlarga bog'lash
bot.command('add_expense', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // ctx endi .conversation xususiyatiga ega ekanligini TypeScript biladi
    yield ctx.conversation.enter('addExpense');
}));
bot.command("add_income", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("addIncome");
}));
bot.command('balance', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        return;
    yield ctx.reply("💰 Balansingiz hisoblanmoqda...");
    // Foydalanuvchining umumiy daromadini hisoblash
    const [incomeResult] = yield db_1.db.select({
        total: (0, drizzle_orm_1.sql) `sum(${schema_1.incomes.amount})`.mapWith(Number)
    }).from(schema_1.incomes).where((0, drizzle_orm_1.eq)(schema_1.incomes.userId, userId));
    // Foydalanuvchining umumiy xarajatini hisoblash
    const [expenseResult] = yield db_1.db.select({
        total: (0, drizzle_orm_1.sql) `sum(${schema_1.expenses.amount})`.mapWith(Number)
    }).from(schema_1.expenses).where((0, drizzle_orm_1.eq)(schema_1.expenses.userId, userId));
    // Natija bo'lmasa, 0 deb olamiz
    const totalIncome = (incomeResult === null || incomeResult === void 0 ? void 0 : incomeResult.total) || 0;
    const totalExpense = (expenseResult === null || expenseResult === void 0 ? void 0 : expenseResult.total) || 0;
    const balance = totalIncome - totalExpense;
    // Natijani so'mga o'tkazib, foydalanuvchiga yuboramiz
    yield ctx.reply(`📊 Umumiy Balans:\n\n` +
        `📈 Jami daromad: ${totalIncome / 100} so'm\n` +
        `📉 Jami xarajat: ${totalExpense / 100} so'm\n\n` +
        `💰 Joriy balans: ${balance / 100} so'm`);
}));
bot.command('report', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        return;
    yield ctx.reply("📊 Hisobot tayyorlanmoqda...");
    // 1. Xarajatlarni kategoriyalar bo'yicha guruhlash
    const expensesByCategory = yield db_1.db.select({
        category: schema_1.expenses.category,
        total: (0, drizzle_orm_1.sql) `sum(${schema_1.expenses.amount})`.mapWith(Number)
    }).from(schema_1.expenses)
        .where((0, drizzle_orm_1.eq)(schema_1.expenses.userId, userId))
        .groupBy(schema_1.expenses.category);
    // 2. Hisobot matnini yig'ishni boshlash
    let reportText = "📊 Xarajatlar Hisoboti (Kategoriyalar bo'yicha):\n\n";
    if (expensesByCategory.length === 0) {
        reportText += "Sizda hozircha xarajatlar mavjud emas.";
    }
    else {
        expensesByCategory.forEach(item => {
            // Har bir kategoriya uchun qator qo'shamiz va so'mga o'tkazamiz
            reportText += `▪️ ${item.category}: ${item.total / 100} so'm\n`;
        });
    }
    // 3. Umumiy ma'lumotlarni ham qo'shamiz (balans kabi)
    const [incomeResult] = yield db_1.db.select({ total: (0, drizzle_orm_1.sql) `sum(${schema_1.incomes.amount})`.mapWith(Number) }).from(schema_1.incomes).where((0, drizzle_orm_1.eq)(schema_1.incomes.userId, userId));
    const [expenseResult] = yield db_1.db.select({ total: (0, drizzle_orm_1.sql) `sum(${schema_1.expenses.amount})`.mapWith(Number) }).from(schema_1.expenses).where((0, drizzle_orm_1.eq)(schema_1.expenses.userId, userId));
    const totalIncome = (incomeResult === null || incomeResult === void 0 ? void 0 : incomeResult.total) || 0;
    const totalExpense = (expenseResult === null || expenseResult === void 0 ? void 0 : expenseResult.total) || 0;
    reportText += `\n---------------------\n\n`;
    reportText += `📈 Jami daromad: ${totalIncome / 100} so'm\n`;
    reportText += `📉 Jami xarajat: ${totalExpense / 100} so'm\n`;
    reportText += `💰 Sof balans: ${(totalIncome - totalExpense) / 100} so'm`;
    yield ctx.reply(reportText);
}));
// Botni ishga tushirish
bot.start();
console.log("Bot ishga tushdi!");
