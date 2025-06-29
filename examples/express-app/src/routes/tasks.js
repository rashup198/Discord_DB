"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbService_1 = require("../services/dbService");
const router = express_1.default.Router();
// Create task
router.post('/', async (req, res) => {
    try {
        const task = {
            ...req.body,
            createdAt: new Date(),
            completed: false
        };
        const result = await dbService_1.db.insertOne(task);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get all tasks
router.get('/', async (req, res) => {
    try {
        const { completed, sort = 'createdAt' } = req.query;
        const filter = {};
        if (completed !== undefined) {
            filter.completed = completed === 'true';
        }
        const tasks = await dbService_1.db.find(filter, {
            sort: { [sort]: -1 }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update task
router.put('/:id', async (req, res) => {
    try {
        const updated = await dbService_1.db.updateOne({ _id: req.params.id }, { $set: req.body });
        if (!updated)
            return res.status(404).json({ error: 'Task not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await dbService_1.db.deleteOne({ _id: req.params.id });
        if (!deleted)
            return res.status(404).json({ error: 'Task not found' });
        res.status(204).end();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
    try {
        const task = await dbService_1.db.findOne({ _id: req.params.id });
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        const updated = await dbService_1.db.updateOne({ _id: req.params.id }, { $set: { completed: !task.completed } });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map