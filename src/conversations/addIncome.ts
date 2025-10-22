// src/conversations/addIncome.ts faylining to'g'rilangan varianti

// 1. To'g'ri tiplarni import qilamiz
import { type MyContext, type MyConversation } from '../bot'; 
import { db } from "../db";
import { incomes } from "../db/schema";


export async function addIncome(conversation: MyConversation, ctx: MyContext){
    await ctx.reply("Daromad manbasini kiriting (masalan: ish haqi, qo‘shimcha ish)");
    const nameCtx = await conversation.wait();
    const incomeName = nameCtx.message?.text;

    await ctx.reply("Summasini kiriting (faqat raqamda, masalan, 5000):");
    const ammountCtx = await conversation.waitFor('message:text');
    const incomeAmount = parseInt(ammountCtx.message!.text, 10);

    const userId = ctx.from?.id;
    
    // Kiritilgan ma'lumotlarni tekshiramiz
    if (!incomeName || isNaN(incomeAmount) || !userId) {
        await ctx.reply("Ma'lumotlar noto'g'ri kiritildi. Iltimos, /add_income buyrug'ini qaytadan boshlang.");
        return;
    }
      
    // Ma'lumotlarni bazaga saqlaymiz
    await db.insert(incomes).values({
        userId: userId,
        source: incomeName,
        amount: incomeAmount * 100 // <<-- 3. MUHIM: Tiyinga o'tkazib saqlash
    });

    await ctx.reply(`✅ "${incomeName}" manbasidan ${incomeAmount} so'm daromad muvaffaqiyatli qo'shildi!`);
}