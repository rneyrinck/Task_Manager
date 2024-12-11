import { createClient } from 'redis';

export const connectRedis = () => {
  const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

  const redisClient = createClient({
    socket: { host: REDIS_HOST, port: REDIS_PORT },
    password: REDIS_PASSWORD,
  });

  redisClient.connect()
    .then(() => console.log('Redis connected'))
    .catch((err) => console.error('Error connecting to Redis:', err));

  return redisClient; // Return the Redis client for use elsewhere in the app
};
