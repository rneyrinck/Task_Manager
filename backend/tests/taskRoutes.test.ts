import request from 'supertest';
import express from 'express';
import taskRoutes from '../routes/taskRoutes';
import mongoose from 'mongoose';
import { Task } from '../models/Task';

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);
import * as dotenv from 'dotenv';
dotenv.config();
jest.setTimeout(30000);
describe('Task Routes', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || ''); // Use your external MongoDB
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase(); // Clean up test data
        await mongoose.connection.close();        // Close the connection
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
        // Ensure there is at least one task in the database
        await Task.create({
            title: 'Sample Task',
            description: 'Task for GET testing',
            priority: 'Low',
            status: 'Pending',
            dueDate: new Date(),
            userId: new mongoose.Types.ObjectId(),
        });

        const response = await request(app).get('/api/tasks');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});
