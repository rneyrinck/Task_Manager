import mongoose from 'mongoose';
import { Task } from '../models/Task';

describe('Task Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a task successfully', async () => {
    const task = await Task.create({
      title: 'Test Task',
      description: 'This is a test task.',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(),
      userId: new mongoose.Types.ObjectId(),
    });

    expect(task._id).toBeDefined();
    expect(task.title).toBe('Test Task');
  });
});
