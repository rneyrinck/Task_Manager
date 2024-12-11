import * as dotenv from 'dotenv';
import request from 'supertest';
import express from 'express';
import taskRoutes from '../routes/taskRoutes';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { createClient } from 'redis';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Initialize a separate Redis client for tests
const redisClient = createClient({
  socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
  password: process.env.REDIS_PASSWORD,
});

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || '');
  await redisClient.connect();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await redisClient.quit();
});

beforeEach(async () => {
  await Task.deleteMany({});
  await redisClient.flushAll(); // Clear Redis cache
});

describe('Task Routes', () => {
  it('should create a task via POST /api/tasks', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'New Task',
        description: 'This is a new task.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(),
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Task');
  });

  it('should retrieve all tasks via GET /api/tasks', async () => {
    await Task.create({
      title: 'Sample Task',
      description: 'Task for GET testing',
      priority: 'Low',
      status: 'Pending',
      dueDate: new Date(),
    });

    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.tasks)).toBe(true);
    expect(response.body.tasks.length).toBeGreaterThan(0);
  });

  it('should return paginated tasks via GET /api/tasks?page=2&limit=2', async () => {
    await Task.insertMany([
      { title: 'Task 1', description: 'Test task 1', priority: 'Low', status: 'Pending', dueDate: new Date() },
      { title: 'Task 2', description: 'Test task 2', priority: 'Medium', status: 'In Progress', dueDate: new Date() },
      { title: 'Task 3', description: 'Test task 3', priority: 'High', status: 'Completed', dueDate: new Date() },
    ]);

    const response = await request(app).get('/api/tasks?page=2&limit=2');
    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1); // Only 1 task on the second page
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(2);
  });

  it('should cache tasks and return cached data for subsequent GET /api/tasks', async () => {
    await Task.create({
      title: 'Sample Task',
      description: 'Task for cache testing',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(),
    });

    // First request (populates cache)
    const response1 = await request(app).get('/api/tasks');
    expect(response1.status).toBe(200);

    // Check Redis cache directly
    const cachedTasks = await redisClient.get('tasks:1:10:::');
    expect(cachedTasks).toBeDefined();

    // Second request (uses cache)
    const response2 = await request(app).get('/api/tasks');
    expect(response2.status).toBe(200);
    expect(response2.body.tasks.length).toBeGreaterThan(0);
  });

  it('should invalidate cache when a task is created', async () => {
    // Trigger cache by fetching tasks
    await request(app).get('/api/tasks');

    // Check Redis cache
    let cachedTasks = await redisClient.get('tasks:1:10:::');
    expect(cachedTasks).toBeDefined();

    // Create a new task
    await request(app).post('/api/tasks').send({
      title: 'New Task',
      description: 'Task that invalidates cache',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(),
    });

    // Check Redis cache again
    cachedTasks = await redisClient.get('tasks:1:10:::');
    expect(cachedTasks).toBeNull();
  });
});
