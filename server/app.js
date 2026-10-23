import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import productStrategyRoutes from './routes/productStrategyRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import productRoutes from './routes/productRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import marketingProjectRoutes from './routes/marketingProjectRoutes.js';
import brandsRoutes from './routes/brandsRoutes.js';
import marketingProductRoutes from './routes/marketingProductRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import { generatePersonas } from './controllers/personaController.js';
import { protect } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

// Root endpoint for Render health checks and browser verification
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BrandDNA API is live and operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      brands: '/api/brands',
    },
  });
});

app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = stateNames[mongoose.connection.readyState] || 'unknown';

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    database: state,
    readyState: mongoose.connection.readyState,
    message: isConnected
      ? 'AI-Powered Business & Inventory Management API is running cleanly'
      : `Database is currently ${state}. Reconnecting in background...`,
    timestamp: new Date().toISOString(),
  });
});

// Database connection readiness guard: prevents 10-second buffer timeouts if disconnected
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();

  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // If currently connecting, give it a brief grace period (up to 3s)
  if (mongoose.connection.readyState === 2) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (mongoose.connection.readyState === 1) {
        return next();
      }
    }
  }

  // If disconnected (readyState === 0), trigger background reconnection immediately
  connectDB().catch(() => {});

  return res.status(503).json({
    success: false,
    message: 'Database is connecting. Please retry in a few moments.',
  });
});

// Preserved & Legacy Routes
app.use('/api/auth', authRoutes);
app.use('/api/startup', startupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/product-strategy', productStrategyRoutes);
app.use('/api/customer-persona', personaRoutes);
app.post('/api/generate-personas', protect, generatePersonas);

// Business Management Modules
app.use('/api/brands', brandsRoutes);
app.use('/api/marketing-products', marketingProductRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/marketing-projects', marketingProjectRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
