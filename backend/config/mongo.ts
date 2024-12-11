import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || '';
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
