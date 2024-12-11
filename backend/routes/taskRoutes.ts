import express from 'express';
import { Task } from '../models/Task';

const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST a new task
router.post('/', async (req, res) => {
  const { title, description, priority, status, dueDate, userId } = req.body;
  try {
    const newTask = await Task.create({ title, description, priority, status, dueDate, userId });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

export default router;
