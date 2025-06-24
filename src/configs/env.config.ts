import * as dotenv from "dotenv";
dotenv.config();

export const configs = {
    BOT_TOKEN: process.env.BOT_TOKEN!,
    GROQ_API_KEY: process.env.GROQ_API_KEY!,
}
