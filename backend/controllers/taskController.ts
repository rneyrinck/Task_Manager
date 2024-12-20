import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
dotenv.config();
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
    await redisClient.del('tasks'); // Invalidate the tasks list cache
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query;

    // Generate a unique cache key based on query parameters
    const cacheKey = `tasks:${page}:${limit}:${search || ''}:${status || ''}:${priority || ''}`;
    const cachedTasks = await redisClient.get(cacheKey);

    if (cachedTasks) {
      res.status(200).json(JSON.parse(cachedTasks));
      return; // Stop further execution
    }

    // Build a dynamic query object
    const query: any = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // Pagination logic
    const skip = (Number(page) - 1) * Number(limit);
    const tasks = await Task.find(query).skip(skip).limit(Number(limit));
    const total = await Task.countDocuments(query);

    // Prepare response
    const response = {
      tasks,
      total,
      page: Number(page),
      limit: Number(limit),
    };

    // Cache the response
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 }); // Cache for 60 seconds
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tasks', error });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check Redis Cache
    const cacheKey = `task:${id}`;
    const cachedTask = await redisClient.get(cacheKey);

    if (cachedTask) {
      res.status(200).json(JSON.parse(cachedTask));
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      // Cache the task
      await redisClient.set(cacheKey, JSON.stringify(task), { EX: 60 }); // Cache for 60 seconds
      res.status(200).json(task);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve task', error });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      await redisClient.del('tasks'); // Invalidate the tasks list cache
      await redisClient.del(`task:${id}`); // Invalidate individual task cache
      res.status(200).json(task);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      await redisClient.del('tasks'); // Invalidate the tasks list cache
      await redisClient.del(`task:${id}`); // Invalidate individual task cache
      res.status(200).json({ message: 'Task deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};
