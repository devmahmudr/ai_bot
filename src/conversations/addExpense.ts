import { type Conversation, type ConversationFlavor } from '@grammyjs/conversations';
import { type Context } from 'grammy';
import { db } from '../db/';
import { expenses } from '../db/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

// Kontekst (Context) tipini suhbatlar bilan kengaytiramiz
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

export async function addExpense(conversation: MyConversation, ctx: MyContext) {
  // 1. Xarajat nomini so'raymiz
  await ctx.reply("Xarajat nomini kiriting (masalan, 'Non' yoki 'Avtobus'):");
  const nameCtx = await conversation.wait();
  const expenseName = nameCtx.message?.text;

  // 2. Summani so'raymiz
  await ctx.reply("Summasini kiriting (faqat raqamda, masalan, 5000):");
  const amountCtx = await conversation.waitFor('message:text');
  const expenseAmount = parseInt(amountCtx.message.text, 10);

  // 3. Kategoriyani so'raymiz
  await ctx.reply("Kategoriyasini kiriting (masalan, 'Oziq-ovqat', 'Transport'):");
  const categoryCtx = await conversation.wait();
  const expenseCategory = categoryCtx.message?.text;

  const userId = ctx.from?.id;

  // Kiritilgan ma'lumotlarni tekshiramiz
  if (!expenseName || isNaN(expenseAmount) || !expenseCategory || !userId) {
    await ctx.reply("Ma'lumotlar noto'g'ri kiritildi. Iltimos, /add_expense buyrug'ini qaytadan boshlang.");
    return;
  }

  const expenseAmountInTiyin = expenseAmount * 100;
  
  // 4. Ma'lumotlarni bazaga saqlaymiz
  await db.insert(expenses).values({
    userId: userId,
    name: expenseName,
    amount: expenseAmountInTiyin, // Tiyinga o'tkazib saqlaymiz
    category: expenseCategory,
  });

  await ctx.reply(`✅ "${expenseName}" xarajati muvaffaqiyatli qo'shildi!`);

  const MONTHLY_LIMIT = 2000000 * 100; // Misol uchun 2,000,000 so'm

  // 2. Joriy oyning birinchi va oxirgi kunini aniqlaymiz
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // 3. Shu oy uchun jami xarajatlarni bazadan hisoblaymiz
  const [monthlyExpenseResult] = await db.select({
      total: sql<number>`sum(${expenses.amount})`.mapWith(Number)
  }).from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.createdAt, startDate), //createdAt >= startDate
        lte(expenses.createdAt, endDate)    //createdAt <= endDate
      )
    );

  const totalMonthlyExpense = monthlyExpenseResult?.total || 0;

  // 4. Limit oshganini tekshiramiz (eng aqlli usuli)
  // Faqatgina limit aynan SHU xarajatdan keyin oshgan bo'lsa xabar beramiz.
  // Bu foydalanuvchini har safar bezovta qilishning oldini oladi.
  const totalBeforeThisExpense = totalMonthlyExpense - expenseAmountInTiyin;

  if (totalMonthlyExpense > MONTHLY_LIMIT && totalBeforeThisExpense <= MONTHLY_LIMIT) {
    await ctx.reply(
      `🔔 Ogohlantirish! Siz bu oy uchun belgilangan xarajat limitidan (${MONTHLY_LIMIT / 100} so'm) oshib ketdingiz.\n` +
      `Joriy oylik xarajatingiz: ${totalMonthlyExpense / 100} so'm.`
    );
  }
}