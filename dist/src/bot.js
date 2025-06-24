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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groq = exports.bot = void 0;
const grammy_1 = require("grammy");
const env_config_1 = require("./configs/env.config");
const user_session_1 = require("./session/user.session");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const user_service_1 = require("./services/user.service");
const command_config_1 = require("./configs/command.config");
exports.bot = new grammy_1.Bot(env_config_1.configs.BOT_TOKEN);
exports.groq = new groq_sdk_1.default({ apiKey: env_config_1.configs.GROQ_API_KEY });
exports.bot.use(user_session_1.sessionMiddleware);
exports.bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield ctx.reply(`👋 Salom ${((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name) || "foydalanuvchi"}!\n\n` +
        `Men sizga sun'iy intellekt yordamida savollarga javob beraman.\n\n` +
        `🗣 Tilni o'zgartirish uchun /language buyrug'idan foydalaning.\n\n` +
        `❓ Oddiy savolingizni yozing va men javob beraman.`);
}));
exports.bot.command("language", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Choose a language:", {
        reply_markup: {
            keyboard: [["O‘zbek", "English"]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}));
exports.bot.hears(["O‘zbek", "English"], (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const lang = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === "O‘zbek" ? "uz" : "en";
    ctx.session.language = lang;
    ctx.session.messages = []; // Reset chat so system prompt gets injected again
    yield ctx.reply(`Language switched to ${(_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text}`, {
        reply_markup: {
            remove_keyboard: true,
        },
    });
}));
(0, user_service_1.UserMessage)();
(0, command_config_1.setCommands)();
exports.bot.start();
console.log("bot started");
