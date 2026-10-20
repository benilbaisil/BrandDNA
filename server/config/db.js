import mongoose from 'mongoose';
import './env.js';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/branddna_ai';

    const conn = await mongoose.connect(mongoUri);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`💥 MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running — fix your Atlas IP whitelist or connection string.');
    // Do NOT throw — let the server stay alive so proxy doesn't 502
  }
};
