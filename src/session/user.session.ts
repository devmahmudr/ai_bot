import { session } from "grammy";
import { MyContext } from "../types/context.type";
import { FileAdapter } from "@grammyjs/storage-file";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export interface SessionData{
    messages: ChatCompletionMessageParam[],
    language: "uz" | "en" 
}

export const sessionMiddleware = session<SessionData,MyContext>({
    initial: ()=>({
        messages:[],
        language : "uz"
    }),
    storage: new FileAdapter({
        dirName: "sessions"
    })
})