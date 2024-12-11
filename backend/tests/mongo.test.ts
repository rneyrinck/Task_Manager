import mongoose from 'mongoose';

jest.setTimeout(30000);
describe('MongoDB Connection', () => {
    beforeAll(async () => {
        const uri = process.env.MONGO_URI;
        console.log('MongoDB URI:', uri);
        if (!uri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        await mongoose.connect(uri);
    });

    it('should connect to MongoDB successfully', () => {
        expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase(); // Clean up test database
        await mongoose.connection.close();        // Close the connection
    });
});
