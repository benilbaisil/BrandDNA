import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabaseIfEmpty } from './utils/seedData.js';
import dotenv from 'dotenv';
import './shipment-api-server.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// 1. Start HTTP Server immediately so port 5000 is listening right away for incoming requests
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Business & Inventory Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error(`❌ Server error:`, err);
  }
});

// 2. Asynchronously connect to Database & seed defaults
connectDB()
  .then(async (conn) => {
    if (conn) {
      try {
        await seedDatabaseIfEmpty();
      } catch (seedErr) {
        console.warn('⚠️ Seeding error (non-fatal):', seedErr.message);
      }
    }
  })
  .catch((err) => {
    console.error('⚠️ Database initialization error:', err.message);
  });


