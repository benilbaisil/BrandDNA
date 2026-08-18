import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BrandDNA API Server running at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Kill the existing process and restart.`);
      console.error(`   Run: Get-NetTCPConnection -LocalPort ${PORT} | Select OwningProcess`);
      process.exit(1);
    } else {
      throw err;
    }
  });
});
