import mongoose from 'mongoose';
import './env.js';

let isConnecting = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 2500;

// Setup connection lifecycle listeners
mongoose.connection.on('connected', () => {
  console.log(`🍃 MongoDB Connected: ${mongoose.connection.host} (DB: ${mongoose.connection.name})`);
  retryCount = 0;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting automatic reconnection...');
  if (!isConnecting) {
    setTimeout(() => {
      connectDB().catch((err) => console.error('MongoDB reconnection attempt failed:', err.message));
    }, RETRY_INTERVAL_MS);
  }
});

mongoose.connection.on('error', (err) => {
  console.error(`💥 MongoDB runtime error: ${err.message}`);
});

export const isDBConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, wait for resolution
  if (isConnecting) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(check);
          resolve(mongoose.connection);
        } else if (mongoose.connection.readyState === 0) {
          clearInterval(check);
          resolve(null);
        }
      }, 300);
    });
  }

  isConnecting = true;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/branddna_ai';

  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  while (retryCount < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(mongoUri, connectionOptions);
      isConnecting = false;
      return conn;
    } catch (error) {
      retryCount++;
      console.error(`💥 MongoDB Connection Error (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
      if (retryCount >= MAX_RETRIES) {
        console.error('⚠️  Reached maximum MongoDB connection attempts. Background reconnection will keep trying.');
        isConnecting = false;
        // Schedule future background retry so server never permanently stays disconnected
        setTimeout(() => {
          retryCount = 0;
          connectDB().catch(() => {});
        }, 10000);
        return null;
      }
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
    }
  }

  isConnecting = false;
  return null;
};

