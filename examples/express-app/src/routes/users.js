"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbService_1 = require("../services/dbService");
const router = express_1.default.Router();
// Create user
router.post('/', async (req, res) => {
    try {
        const payload = req.body;
        const user = await dbService_1.db.insertOne(dbService_1.usersCollection, payload);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create user' });
    }
});
// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await dbService_1.db.find(dbService_1.usersCollection, {}, { sort: { name: 1 } });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
});
// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await dbService_1.db.findOne(dbService_1.usersCollection, { _id: req.params.id });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch user' });
    }
});
// Update user
router.put('/:id', async (req, res) => {
    try {
        const updated = await dbService_1.db.updateOne(dbService_1.usersCollection, { _id: req.params.id }, { $set: req.body });
        if (!updated)
            return res.status(404).json({ error: 'User not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update user' });
    }
});
// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await dbService_1.db.deleteOne(dbService_1.usersCollection, { _id: req.params.id });
        if (!deleted)
            return res.status(404).json({ error: 'User not found' });
        res.status(204).end();
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map