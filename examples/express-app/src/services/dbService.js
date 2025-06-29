"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksCollection = exports.usersCollection = exports.db = void 0;
exports.initializeCollections = initializeCollections;
exports.getCollection = getCollection;
const discordongo_db_1 = require("discordongo-db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.db = new discordongo_db_1.DiscordDB({
    botToken: process.env.DISCORD_BOT_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    encryptionKey: process.env.ENCRYPTION_KEY,
    cacheEnabled: true
});
exports.usersCollection = 'users';
exports.tasksCollection = 'tasks';
async function initializeCollections() {
    console.log('Collections initialized');
}
async function getCollection(name) {
    return exports.db;
}
//# sourceMappingURL=dbService.js.map