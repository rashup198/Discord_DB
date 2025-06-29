import express from 'express';
import { db, usersCollection, tasksCollection } from '../services/dbService';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [userCount, taskCount, completedTasks] = await Promise.all([
      db.countDocuments({}),
      db.countDocuments({}),
      db.countDocuments({ completed: true })
    ]);
    
    const stats = {
      users: userCount,
      tasks: {
        total: taskCount,
        completed: completedTasks,
        pending: taskCount - completedTasks,
        completionRate: taskCount > 0 
          ? Math.round((completedTasks / taskCount) * 100) 
          : 0
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;