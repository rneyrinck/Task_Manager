import request from 'supertest';
import express from 'express';
import { Task } from '../models/Task';
import taskRoutes from '../routes/taskRoutes';

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb');
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
        userId: new mongoose.Types.ObjectId(),
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Task');
  });

  it('should retrieve tasks via GET /api/tasks', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
