import express from 'express';
import { db, usersCollection } from '../services/dbService';
import { Document } from 'discordongo-db';

const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  try {
    const payload = req.body as Document;
    const user = await db.insertOne(usersCollection, payload);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await db.find(usersCollection, {}, { sort: { name: 1 } });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await db.findOne(usersCollection, { _id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateOne(
      usersCollection,
      { _id: req.params.id },
      { $set: req.body }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteOne(usersCollection, { _id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

export default router;
