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
exports.UserMessage = UserMessage;
const bot_1 = require("../bot");
const lang_service_1 = require("./lang.service");
function UserMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        bot_1.bot.on("message:text", (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userMessage = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
            if (ctx.session.messages.length === 0) {
                ctx.session.messages.push((0, lang_service_1.getSystemPrompt)());
            }
            ctx.session.messages.push({ role: "user", content: userMessage });
            try {
                const client = yield bot_1.groq.chat.completions.create({
                    model: "llama3-70b-8192",
                    messages: ctx.session.messages,
                    temperature: 0.7,
                });
                const reply = client.choices[0].message.content || "No response";
                ctx.session.messages.push({ role: "assistant", content: reply });
                yield ctx.reply(reply);
            }
            catch (err) {
                console.error("❌ Groq API Error:", ((_b = err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
                yield ctx.reply("❌ AI error occurred.");
            }
        }));
    });
}
