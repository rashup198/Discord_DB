
# Discord_DB
 
A TypeScript library that transforms Discord channels into a powerful NoSQL database with MongoDB-like operations, complete with optional AES-256 encryption support. Perfect for prototypes, small projects, and applications needing unconventional data storage solutions.

```ts
import { DiscordDB } from 'discord-db';

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

# Quick Start

## 1. Create Discord Application
Go to Discord Developer Portal

Create New Application → Name it (e.g., "MyDatabaseBot")

Navigate to "Bot" → Create Bot → Reset Token → Copy Token

## 2. Set Up Bot Permissions
In "OAuth2" → "URL Generator":

Scopes: bot and applications.commands

Bot Permissions:

View Channel

Send Messages

Manage Messages

Read Message History

Use generated URL to add bot to your server

## 3. Get Channel ID
In Discord app, enable Developer Mode:

Settings → Advanced → Developer Mode ON

Right-click your text channel → "Copy ID"

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


#Query Operators
```ts
// Comparison
{ age: { $gt: 18 } }          // Greater than
{ rating: { $lte: 4.5 } }     // Less than or equal
{ status: { $in: ['active', 'pending'] } } // In array

// Logical
{ $and: [{ age: { $gt: 18 } }, { age: { $lt: 65 } }] }
{ $or: [{ role: 'admin' }, { premium: true }] }

// Element
{ email: { $exists: true } }   // Field exists

// Evaluation
{ name: { $regex: /^john/i } } // Regular expression
```

## Update Operators
```ts
{ $set: { name: 'Alice', status: 'active' } }  // Set fields
{ $unset: { tempField: 1 } }                   // Remove field
{ $inc: { age: 1, score: 5 } }                 // Increment values
{ $push: { tags: 'new-tag' } }                 // Add to array
{ $pull: { tags: 'old-tag' } }                 // Remove from array
```


# Quick Start

## 1. Create Discord Application
Go to Discord Developer Portal

Create New Application → Name it (e.g., "MyDatabaseBot")

Navigate to "Bot" → Create Bot → Reset Token → Copy Token

## 2. Set Up Bot Permissions
In "OAuth2" → "URL Generator":

Scopes: bot and applications.commands

Bot Permissions:

View Channel

Send Messages

Manage Messages

Read Message History

Use generated URL to add bot to your server

## 3. Get Channel ID
In Discord app, enable Developer Mode:

Settings → Advanced → Developer Mode ON

Right-click your text channel → "Copy ID"


# Limitations & Considerations

Message Size Limit: 2000 characters per document (Discord constraint)

Rate Limits: Discord API rate limits apply (auto-handled with retries)

History Limit: Discord only retains last 100,000 messages per channel

No Transactions: Atomic operations not guaranteed

No Schema Enforcement: Flexible but requires validation

# Running Examples

```ts
# Create .env file first!
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id
ENCRYPTION_KEY=optional_32_char_key

npx ts-node examples/basic-usage.ts
```

# Express.js REST API
```ts
cd examples/express-app
npm install
cp .env.example .env # Add your credentials
npm run dev

# Endpoints:
GET    /health          # Health check
GET    /api/users       # List users
POST   /api/users       # Create user
GET    /api/users/:id   # Get user
PUT    /api/users/:id   # Update user
DELETE /api/users/:id   # Delete user
GET    /api/stats       # Statistics
```

# 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a pull request

## Development Setup
```ts
git clone https://github.com/your-username/discordongo-db.git
cd discordongo-db
npm install

# Build library
npm run build

# Run tests
npm test

# Start example apps
npm run example:basic
npm run example:express
```
