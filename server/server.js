import './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabaseIfEmpty } from './utils/seedData.js';
import './shipment-api-server.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. Establish database connection and run seeding
  try {
    const conn = await connectDB();
    if (conn) {
      try {
        await seedDatabaseIfEmpty();
      } catch (seedErr) {
        console.warn('⚠️ Seeding error (non-fatal):', seedErr.message);
      }

      // Pre-warm read caches in background so all pages display immediately
      setTimeout(async () => {
        try {
          const { getInventoryDashboard, getAdminDashboard } = await import('./controllers/dashboardController.js');
          const { getDeliveryAgents } = await import('./controllers/deliveryController.js');
          const { getProducts, getCategories } = await import('./controllers/productController.js');
          const { getDashboardStats, getSummary, getLedger } = await import('./controllers/inventoryController.js');
          const { getStats, getUsers } = await import('./controllers/adminController.js');
          const mockRes = { status: () => ({ json: () => {} }), json: () => {} };
          await Promise.all([
            getInventoryDashboard({ query: {} }, mockRes),
            getAdminDashboard({ query: {} }, mockRes),
            getDeliveryAgents({ query: {} }, mockRes),
            getProducts({ query: {} }, mockRes),
            getProducts({ query: { status: 'ALL' } }, mockRes),
            getCategories({ query: {} }, mockRes),
            getDashboardStats({ query: {} }, mockRes),
            getSummary({ query: {} }, mockRes),
            getLedger({ query: {} }, mockRes),
            getStats({ query: {} }, mockRes),
            getUsers({ query: {} }, mockRes),
          ]);
          console.log('⚡ All read caches pre-warmed for 0ms instant page display across all pages.');
        } catch (e) {
          console.warn('⚠️ Pre-warmer non-fatal error:', e.message);
        }
      }, 500);
    }
  } catch (err) {
    console.error('⚠️ Database initialization error:', err.message);
  }

  // 2. Start HTTP Server
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
};

start();


