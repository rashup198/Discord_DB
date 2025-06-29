"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbService_1 = require("../services/dbService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const [userCount, taskCount, completedTasks] = await Promise.all([
            dbService_1.db.countDocuments({}),
            dbService_1.db.countDocuments({}),
            dbService_1.db.countDocuments({ completed: true })
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map