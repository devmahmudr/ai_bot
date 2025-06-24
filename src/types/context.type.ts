import { Context, SessionFlavor } from "grammy";
import { SessionData } from "../session/user.session";

export type MyContext = Context & SessionFlavor<SessionData>;