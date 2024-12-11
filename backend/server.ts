import * as dotenv from 'dotenv';
import {connectMongoDB} from './config/mongo';
import {connectRedis} from './config/redis';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

import express = require('express');
import cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Port configuration
const PORT = process.env.PORT || 5000;

// Server Initialization
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Connect to Redis
        const redisClient = await connectRedis();

        // Test Redis Client in a Route
        app.get('/', async (req, res) => {
            try {
                await redisClient.set('ping', 'pong');
                const value = await redisClient.get('ping');
                res.json({message: 'Server is running successfully', redisTest: value});
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                console.error('Error in Redis operation:', err.message);
                res.status(500).send('Redis operation failed');
            }
        });
        // Task Routes
        app.use('/api/tasks', taskRoutes);
        // Start Express Server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Failed to start the server: ', err.message);
        process.exit(1); // Exit the process if server initialization fails
    }
};

startServer();
