import { DiscordDB } from 'discordongo-db';
import dotenv from 'dotenv';

dotenv.config();

export const db = new DiscordDB({
  botToken: process.env.DISCORD_BOT_TOKEN!,
  channelId: process.env.DISCORD_CHANNEL_ID!,
  encryptionKey: process.env.ENCRYPTION_KEY,
  cacheEnabled: true
});

export const usersCollection = 'users';
export const tasksCollection = 'tasks';

export async function initializeCollections() {
  console.log('Collections initialized');
}

export async function getCollection(name: string) {
  return db;
}