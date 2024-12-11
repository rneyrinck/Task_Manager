import * as dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import express from 'express';
import taskRoutes from '../routes/taskRoutes';
import mongoose from 'mongoose';
import { Task } from '../models/Task';

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || '');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

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
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should update a task via PUT /api/tasks/:id', async () => {
    const task = await Task.create({
      title: 'Task to Update',
      description: 'Task before update',
      priority: 'Low',
      status: 'Pending',
      dueDate: new Date(),
    });

    const response = await request(app)
      .put(`/api/tasks/${task._id}`)
      .send({
        title: 'Updated Task',
        description: 'Task after update',
        priority: 'High',
        status: 'In Progress',
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Task');
  });

  it('should delete a task via DELETE /api/tasks/:id', async () => {
    const task = await Task.create({
      title: 'Task to Delete',
      description: 'Task to be deleted',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(),
    });

    const response = await request(app).delete(`/api/tasks/${task._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');
  });
});
