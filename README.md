# Discord_DB
 
A TypeScript library that transforms Discord channels into a powerful NoSQL database with MongoDB-like operations, complete with optional AES-256 encryption support. Perfect for prototypes, small projects, and applications needing unconventional data storage solutions.

```ts
import { DiscordDB } from 'discordongo-db';

const db = new DiscordDB({
  botToken: process.env.DISCORD_BOT_TOKEN!,
  channelId: process.env.DISCORD_CHANNEL_ID!,
  encryptionKey: process.env.ENCRYPTION_KEY // Optional
});

// Store encrypted sensitive data
await db.insertOne({ 
  ssn: '123-45-6789',
  creditCard: '4111-1111-1111-1111'
});

// Retrieve and automatically decrypt
const user = await db.findOne({ ssn: '123-45-6789' });
```

# ✨ Features

🔐 Military-Grade Encryption: AES-256-CBC encryption with random IVs

🚀 MongoDB-like API: Familiar syntax for MongoDB users

🔍 Advanced Querying: Supports complex operators ($gt, $in, $regex, etc.)

📊 Pagination & Sorting: Efficient data retrieval with skip/limit and sorting

⚡ Built-in Caching: Optimized performance with configurable cache

🛡️ Error Handling: Comprehensive error types with actionable messages

🌐 Cross-Platform: Works with Node.js, React, React Native

🔧 Configurable: Custom cache TTL, base URL, and encryption settings

#Basic Usage 
```ts
import { DiscordDB } from 'discordongo-db';
import dotenv from 'dotenv';

dotenv.config();

const db = new DiscordDB({
  botToken: process.env.DISCORD_BOT_TOKEN!,
  channelId: process.env.DISCORD_CHANNEL_ID!,
  encryptionKey: process.env.ENCRYPTION_KEY
});

async function runDemo() {
  // Insert document
  await db.insertOne({ 
    name: 'Alice', 
    email: 'alice@example.com',
    age: 30
  });

  // Find documents
  const users = await db.find({ age: { $gt: 25 } });
  console.log('Users over 25:', users);

  // Update document
  await db.updateOne(
    { email: 'alice@example.com' },
    { $inc: { age: 1 } }
  );

  // Delete document
  await db.deleteOne({ email: 'alice@example.com' });
}

runDemo().catch(console.error);
```

#Encryption Guide
Enable AES-256 encryption by providing a 32-character key:
```ts
const secureDB = new DiscordDB({
  botToken: process.env.DISCORD_BOT_TOKEN!,
  channelId: process.env.SECURE_CHANNEL_ID!,
  encryptionKey: 'your-32-character-secret-key-here'
});

// Automatically encrypted before storage
await secureDB.insertOne({
  ssn: '123-45-6789',
  medicalHistory: 'Sensitive data'
});

// Automatically decrypted when retrieved
const record = await secureDB.findOne({ ssn: '123-45-6789' });
```

#Encryption Features
🔒 Automatic encryption/decryption

🔄 Backward compatible with plain text data

⚡ Minimal performance overhead

🔧 Easy enable/disable via configuration

# API Reference
Configuration Options
```ts
interface DiscordDBConfig {
  botToken: string;           // Discord bot token
  channelId: string;          // Channel ID for storage
  baseURL?: string;           // Custom Discord API URL (default: 'https://discord.com/api')
  encryptionKey?: string;     // Encryption key (optional)
  cacheEnabled?: boolean;     // Enable caching (default: true)
  cacheTTL?: number;          // Cache time-to-live in ms (default: 300000)
}
```

## Core Methods

| Method                     | Description                 | Example                                                |
|----------------------------|-----------------------------|--------------------------------------------------------|
| `insertOne(doc)`           | Insert single document      | `await db.insertOne({ name: 'Alice' })`               |
| `find(filter, options)`    | Find documents with filter  | `await db.find({ age: { $gt: 18 } })`                 |
| `findOne(filter)`          | Find single document        | `await db.findOne({ email: 'alice@example.com' })`    |
| `updateOne(filter, update)`| Update single document      | `await db.updateOne({ id: 1 }, { $set: { name: 'Bob' } })` |
| `deleteOne(filter)`        | Delete single document      | `await db.deleteOne({ id: 1 })`                       |
| `countDocuments(filter)`   | Count matching documents    | `await db.countDocuments({ status: 'active' })`       |
| `isEncryptionEnabled()`    | Check encryption status     | `db.isEncryptionEnabled()`                            |
