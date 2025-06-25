import { Bot } from "grammy";
import { configs } from "./configs/env.config";
import { sessionMiddleware } from "./session/user.session";
import { MyContext } from "./types/context.type";
import Groq from "groq-sdk";
import { UserMessage } from "./services/user.service";
import { setCommands } from "./configs/command.config";

export const bot = new Bot<MyContext>(configs.BOT_TOKEN);
export const groq = new Groq({ apiKey: configs.GROQ_API_KEY });
bot.use(sessionMiddleware);
bot.command("start", async (ctx: MyContext) => {
  await ctx.reply(
    `👋 Salom ${ctx.from?.first_name || "foydalanuvchi"}!\n\n` +
      `Men sizga sun'iy intellekt yordamida savollarga javob beraman.\n\n` +
      `❓ Shunchaki savolingizni yozing va men javob beraman.`
  );
});
// bot.command("language", async (ctx) => {
//   await ctx.reply("Choose a language:", {
//     reply_markup: {
//       keyboard: [["O‘zbek", "English"]],
//       resize_keyboard: true,
//       one_time_keyboard: true,
//     },
//   });
// });

// bot.hears(["O‘zbek", "English"], async (ctx) => {
//   const lang = ctx.message?.text === "O‘zbek" ? "uz" : "en";
//   ctx.session.language = lang;
//   ctx.session.messages = []; // Reset chat so system prompt gets injected again
//   await ctx.reply(`Language switched to ${ctx.message?.text}`, {
//     reply_markup: {
//       remove_keyboard: true,
//     },
//   });
// });
UserMessage();
setCommands();

bot.start();
console.log("bot started");
