import { createClient } from 'redis';

export const connectRedis = async () => {
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = Number(process.env.REDIS_PORT);
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

  if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
    throw new Error('Redis connection details are missing in environment variables');
  }

  const redisClient = createClient({
    socket: { host: REDIS_HOST, port: REDIS_PORT },
    password: REDIS_PASSWORD,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));

  try {
    console.log('Connecting to Redis...');
    await redisClient.connect();
    console.log('Redis connected successfully');
    return redisClient; // Return Redis client for use in the app
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error connecting to Redis:', err.message);
    process.exit(1); // Exit the process if Redis connection fails
  }
};
