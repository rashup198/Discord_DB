import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './services/dbService';
import usersRouter from './routes/users';
import tasksRouter from './routes/tasks';
import statsRouter from './routes/stats';
import { DiscordDBError, RateLimitError } from 'discordongo-db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'DiscordDB API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/stats', statsRouter);

// Centralized error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof DiscordDBError) {
    if (err instanceof RateLimitError) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: err.message,
        retryAfter: err.retryAfter
      });
    }
    return res.status(400).json({
      error: 'Database Error',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Initialize database connection
async function initializeDatabase() {
  try {
    // Test connection
    const count = await db.countDocuments();
    console.log(`DiscordDB connected. Found ${count} existing documents.`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initializeDatabase();
});