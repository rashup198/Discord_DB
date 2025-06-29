"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbService_1 = require("./services/dbService");
const users_1 = __importDefault(require("./routes/users"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const stats_1 = __importDefault(require("./routes/stats"));
const discordongo_db_1 = require("discordongo-db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'DiscordDB API is running',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api/users', users_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/stats', stats_1.default);
// Centralized error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof discordongo_db_1.DiscordDBError) {
        if (err instanceof discordongo_db_1.RateLimitError) {
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
        const count = await dbService_1.db.countDocuments();
        console.log(`DiscordDB connected. Found ${count} existing documents.`);
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}
// Start server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initializeDatabase();
});
//# sourceMappingURL=app.js.map