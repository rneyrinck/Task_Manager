import mongoose from 'mongoose';
import { Task } from '../models/Task';
import * as dotenv from 'dotenv';
dotenv.config();
jest.setTimeout(30000);
describe('Task Model', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || ''); // Use your external MongoDB
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase(); // Clean up test data
        await mongoose.connection.close();        // Close the connection
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
