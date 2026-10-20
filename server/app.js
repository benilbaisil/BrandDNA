import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI-Powered Business & Inventory Management API is running cleanly',
    timestamp: new Date().toISOString(),
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
