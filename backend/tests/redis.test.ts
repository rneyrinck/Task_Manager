import { createClient } from 'redis';

describe('Redis Cloud Connection', () => {
  let redisClient: ReturnType<typeof createClient>;

  beforeAll(async () => {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      password: process.env.REDIS_PASSWORD,
    });

    await redisClient.connect();
  });

  it('should set and get a key successfully', async () => {
    await redisClient.set('test_key', 'test_value');
    const value = await redisClient.get('test_key');
    expect(value).toBe('test_value');
  });

  afterAll(async () => {
    await redisClient.disconnect(); // Properly close the Redis client connection
  });
});
