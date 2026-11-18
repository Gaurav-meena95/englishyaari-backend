import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const connect = await mongoose.connect(mongoUri.trim());

    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(' MongoDB Connection Error:', error);
    process.exit(1); 
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});