import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\x1b[32m[Database] MongoDB Connected: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[Database] Error: ${error.message}\x1b[0m`);
    console.warn('\x1b[33m[Database] Warning: Failed to connect to MongoDB. Please set up a valid MONGO_URI in your backend/.env file.\x1b[0m');
    console.warn('\x1b[33m[Database] Continuing server initialization in offline demo mode...\x1b[0m');
  }
};

export default connectDB;
