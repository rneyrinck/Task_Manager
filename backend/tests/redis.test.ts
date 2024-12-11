import { createClient } from 'redis-mock';

describe('Redis Connection', () => {
  let redisClient: ReturnType<typeof createClient>;

  beforeAll(() => {
    redisClient = createClient();
  });

  it('should set and get a key successfully', async () => {
    await redisClient.set('test_key', 'test_value');
    const value = await redisClient.get('test_key');
    expect(value).toBe('test_value');
  });

  afterAll(() => {
    redisClient.quit();
  });
});
