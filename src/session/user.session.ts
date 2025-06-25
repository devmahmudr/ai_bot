import { session } from "grammy";
import { MyContext } from "../types/context.type";
import { FileAdapter } from "@grammyjs/storage-file";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export interface SessionData{
    messages: ChatCompletionMessageParam[],
}

export const sessionMiddleware = session<SessionData,MyContext>({
    initial: ()=>({
        messages:[],
    }),
    storage: new FileAdapter({
        dirName: "sessions"
    })
})