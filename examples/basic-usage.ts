import { DiscordDB } from '../src';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const db = new DiscordDB({
    botToken: process.env.DISCORD_BOT_TOKEN!,
    channelId: process.env.DISCORD_CHANNEL_ID!,
    encryptionKey: process.env.ENCRYPTION_KEY
  });
  await db.ready();
  console.log('Database ready!');
  
await db.insertOne({ name: 'Priyanshu', email: 'rashup198@gmail.com', age: 21, roles: ['admin'] });
  await db.insertOne({ name: 'Rashu', email: 'rashu123@gmail.com', age: 25, roles: ['user'] });
  await db.insertOne({ name: 'Rohan', email: 'rohan@gmail.com', age: 35, roles: ['user', 'moderator'] });

  const allUsers = await db.find();
  console.log('All users:', allUsers);

  const admins = await db.find({
    $or: [
      { roles: 'admin' },
      { age: { $gte: 30 } }
    ]
  });
  console.log('Admins and users 30+:', admins);

  await db.updateOne(
    { email: 'rashup198@gmail.com' },
    { $inc: { age: 1 }, $push: { roles: 'premium' } }
  );

  const updatedAlice = await db.findOne({ email: 'rashup198@gmail.com' });
  console.log('Updated Priyanshu:', updatedAlice);

  const userCount = await db.countDocuments({ roles: 'user' });
  console.log('User count:', userCount);

  const deleted = await db.deleteOne({ email: 'rashup123@gamil.com' });
  console.log('rashu deleted:', deleted);
}

main().catch(console.error);