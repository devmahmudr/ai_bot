import 'dotenv/config';
import { Bot, Context, session, SessionFlavor } from 'grammy';
import {
  conversations,
  type Conversation,
  type ConversationFlavor,
  createConversation,
} from '@grammyjs/conversations';
import { addExpense } from './conversations/addExpense';
import { configs } from './configs/env.config';
import { addIncome } from './conversations/addIncome';
import { expenses, incomes } from './db/schema';
import { eq, sql } from 'drizzle-orm';
import { db } from './db';

// 1. Sessiya ma'lumotlari uchun interfeys yaratamiz (hozircha bo'sh bo'lsa ham)
interface SessionData {}

// 2. O'zimizning maxsus Kontekst (Context) tipimizni aniqlaymiz
// Bu bazaviy Context'ga SessionFlavor va ConversationFlavor'ni qo'shadi
export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;

// 3. addExpense.ts fayli ham shu MyContext'dan foydalanishi uchun uni eksport qilamiz
export type MyConversation = Conversation<MyContext>;


// Bot yaratishda yangi MyContext tipini ko'rsatamiz
const bot = new Bot<MyContext>(configs.BOT_TOKEN);
(async()=>{
  await bot.api.setMyCommands([
        {command:"start",description:"Start the bot"},
        {command: "add_income", description: "Daromad qo'shish"},
        {command: "add_expense", description:"Xarajat qo'shish"},
        {command: "balance", description:"Balansni aniqlash"},
        {command: "report", description:"Hisobotni ko'rish"},
    ])
})()

// Kerakli "middleware"larni o'rnatish
bot.use(session({
  initial: (): SessionData => ({}), // Sessiyani boshlang'ich qiymati
}));
bot.use(conversations());

// Suhbatlarni ro'yxatdan o'tkazish
// Endi bu yerda xatolik bo'lmaydi, chunki bot ham, suhbat ham MyContext'ni ishlatadi
bot.use(createConversation(addExpense));
bot.use(createConversation(addIncome)); 

// "/start" buyrug'iga javob
bot.command('start', (ctx) => {
  ctx.reply("Assalomu alaykum! Shaxsiy moliya hisob-kitob botiga xush kelibsiz!\n\nBuyruqlar:\n/add_expense - Xarajat qo'shish\n/add_income - Daromad qo'shish\n/balance - Balansni ko'rish\n/report - Hisobot olish");
});

// Buyruqlarni suhbatlarga bog'lash
bot.command('add_expense', async (ctx) => {
  // ctx endi .conversation xususiyatiga ega ekanligini TypeScript biladi
  await ctx.conversation.enter('addExpense');
});

bot.command("add_income", async(ctx)=>{
  await ctx.conversation.enter("addIncome")
})

bot.command('balance', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.reply("💰 Balansingiz hisoblanmoqda...");

  // Foydalanuvchining umumiy daromadini hisoblash
  const [incomeResult] = await db.select({
      total: sql<number>`sum(${incomes.amount})`.mapWith(Number)
  }).from(incomes).where(eq(incomes.userId, userId));
  
  // Foydalanuvchining umumiy xarajatini hisoblash
  const [expenseResult] = await db.select({
      total: sql<number>`sum(${expenses.amount})`.mapWith(Number)
  }).from(expenses).where(eq(expenses.userId, userId));

  // Natija bo'lmasa, 0 deb olamiz
  const totalIncome = incomeResult?.total || 0;
  const totalExpense = expenseResult?.total || 0;
  const balance = totalIncome - totalExpense;

  // Natijani so'mga o'tkazib, foydalanuvchiga yuboramiz
  await ctx.reply(
    `📊 Umumiy Balans:\n\n` +
    `📈 Jami daromad: ${totalIncome / 100} so'm\n` +
    `📉 Jami xarajat: ${totalExpense / 100} so'm\n\n` +
    `💰 Joriy balans: ${balance / 100} so'm`
  );
});

bot.command('report', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await ctx.reply("📊 Hisobot tayyorlanmoqda...");

    // 1. Xarajatlarni kategoriyalar bo'yicha guruhlash
    const expensesByCategory = await db.select({
        category: expenses.category,
        total: sql<number>`sum(${expenses.amount})`.mapWith(Number)
    }).from(expenses)
      .where(eq(expenses.userId, userId))
      .groupBy(expenses.category);
    
    // 2. Hisobot matnini yig'ishni boshlash
    let reportText = "📊 Xarajatlar Hisoboti (Kategoriyalar bo'yicha):\n\n";
    
    if (expensesByCategory.length === 0) {
        reportText += "Sizda hozircha xarajatlar mavjud emas.";
    } else {
        expensesByCategory.forEach(item => {
            // Har bir kategoriya uchun qator qo'shamiz va so'mga o'tkazamiz
            reportText += `▪️ ${item.category}: ${item.total / 100} so'm\n`;
        });
    }

    // 3. Umumiy ma'lumotlarni ham qo'shamiz (balans kabi)
    const [incomeResult] = await db.select({ total: sql<number>`sum(${incomes.amount})`.mapWith(Number) }).from(incomes).where(eq(incomes.userId, userId));
    const [expenseResult] = await db.select({ total: sql<number>`sum(${expenses.amount})`.mapWith(Number) }).from(expenses).where(eq(expenses.userId, userId));
    
    const totalIncome = incomeResult?.total || 0;
    const totalExpense = expenseResult?.total || 0;

    reportText += `\n---------------------\n\n`
    reportText += `📈 Jami daromad: ${totalIncome / 100} so'm\n`;
    reportText += `📉 Jami xarajat: ${totalExpense / 100} so'm\n`;
    reportText += `💰 Sof balans: ${(totalIncome - totalExpense) / 100} so'm`;
  
    await ctx.reply(reportText);
});


// Botni ishga tushirish
bot.start();
console.log("Bot ishga tushdi!");