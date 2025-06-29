// test-bot.ts
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

async function testBot() {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    console.error('❌ DISCORD_BOT_TOKEN is not set in .env');
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  console.log('Testing bot token:', botToken.substring(0, 10) + '...');

  try {
    await client.login(botToken);
    console.log('Login successful!');
    console.log(`🤖 Bot tag: ${client.user?.tag}`);
    process.exit(0);
  } catch (error) {
    console.error(' Login failed:');
    console.error(error);
    process.exit(1);
  }
}

testBot();
