import express from 'express';
import { db, tasksCollection } from '../services/dbService';
import { Document } from 'discordongo-db';

const router = express.Router();

// Create task
router.post('/', async (req, res) => {
  try {
    const task = {
      ...req.body,
      createdAt: new Date(),
      completed: false
    };
    const result = await db.insertOne(task);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { completed, sort = 'createdAt' } = req.query;
    const filter: Record<string, any> = {};
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    const tasks = await db.find(filter, {
      sort: { [sort as string]: -1 }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteOne({ _id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await db.findOne({ _id: req.params.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const updated = await db.updateOne(
      { _id: req.params.id },
      { $set: { completed: !task.completed } }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;