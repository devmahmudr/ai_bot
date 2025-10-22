"use strict";
// src/conversations/addIncome.ts faylining to'g'rilangan varianti
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
exports.addIncome = addIncome;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
function addIncome(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        yield ctx.reply("Daromad manbasini kiriting (masalan: ish haqi, qo‘shimcha ish)");
        const nameCtx = yield conversation.wait();
        const incomeName = (_a = nameCtx.message) === null || _a === void 0 ? void 0 : _a.text;
        yield ctx.reply("Summasini kiriting (faqat raqamda, masalan, 5000):");
        const ammountCtx = yield conversation.waitFor('message:text');
        const incomeAmount = parseInt(ammountCtx.message.text, 10);
        const userId = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
        // Kiritilgan ma'lumotlarni tekshiramiz
        if (!incomeName || isNaN(incomeAmount) || !userId) {
            yield ctx.reply("Ma'lumotlar noto'g'ri kiritildi. Iltimos, /add_income buyrug'ini qaytadan boshlang.");
            return;
        }
        // Ma'lumotlarni bazaga saqlaymiz
        yield db_1.db.insert(schema_1.incomes).values({
            userId: userId,
            source: incomeName,
            amount: incomeAmount * 100 // <<-- 3. MUHIM: Tiyinga o'tkazib saqlash
        });
        yield ctx.reply(`✅ "${incomeName}" manbasidan ${incomeAmount} so'm daromad muvaffaqiyatli qo'shildi!`);
    });
}
