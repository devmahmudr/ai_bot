import { bot } from "../bot";

export async function setCommands(){
    await bot.api.setMyCommands([
        {command:"start",description:"Start the bot"},
        {command:"language", description: "changing the language"}
    ])
}