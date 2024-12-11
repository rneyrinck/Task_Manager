import mongoose from 'mongoose';
import { connectMongoDB } from '../config/mongo';

describe('MongoDB Connection', () => {
  beforeAll(async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
  });

  it('should connect to MongoDB successfully', async () => {
    await connectMongoDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
