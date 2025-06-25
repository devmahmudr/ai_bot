import { bot, groq } from "../bot";
import { getSystemPrompt } from "./lang.service";

export async function UserMessage() {
  bot.on("message:text", async (ctx) => {
    const userMessage = ctx.message?.text;

    if (ctx.session.messages.length === 0) {
      ctx.session.messages.push(getSystemPrompt());
    }
    ctx.session.messages.push({ role: "user", content: userMessage });

    try {
      const client = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: ctx.session.messages,
        temperature: 0.7,
      });

      const reply = client.choices[0].message.content || "No response";
      ctx.session.messages.push({ role: "assistant", content: reply });

      await ctx.reply(reply);
    } catch (err: any) {
      console.error("❌ Groq API Error:", err.response?.data || err.message);
      await ctx.reply("❌ AI error occurred.");
    }
  });
}
