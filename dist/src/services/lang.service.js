"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemPrompt = getSystemPrompt;
function getSystemPrompt(lang) {
    const prompts = {
        uz: "Siz doim o'zbek tilida foydalanuvchiga javob berasiz. Faqat o'zbek tilidan foydalaning. Foydalanuvchiga agar hohlasa tilni o'zgartirmoqchi bo'lsa /language buyrug'idan foydalanishini ayting.",
        en: "You always respond to the user in English. Use only English. If the user wants to switch language, tell them to use the /language command.",
    };
    return {
        role: "system",
        content: prompts[lang],
    };
}
