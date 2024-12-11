import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { createClient } from 'redis';

// Initialize Redis Client
const redisClient = createClient({
  socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch((err) => console.error('Redis connection error:', err));

// Controller Functions
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const cachedTasks = await redisClient.get('tasks');
    if (cachedTasks) {
      res.status(200).json(JSON.parse(cachedTasks));
    }

    const tasks = await Task.find();
    await redisClient.set('tasks', JSON.stringify(tasks), { EX: 60 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tasks', error });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.status(200).json(task);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve task', error });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      await redisClient.del('tasks'); // Invalidate cache
      res.status(200).json(task);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      await redisClient.del('tasks'); // Invalidate cache
      res.status(200).json({ message: 'Task deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};
