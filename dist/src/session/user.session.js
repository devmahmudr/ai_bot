"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = void 0;
const grammy_1 = require("grammy");
const storage_file_1 = require("@grammyjs/storage-file");
exports.sessionMiddleware = (0, grammy_1.session)({
    initial: () => ({
        messages: [],
    }),
    storage: new storage_file_1.FileAdapter({
        dirName: "sessions"
    })
});
