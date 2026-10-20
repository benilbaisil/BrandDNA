import express from 'express';
import {
  getSummary,
  getDashboardStats,
  getLedger,
  stockIn,
  stockOut,
  recordDamage,
  adjustStock,
  getReports,
  getInventoryIntelligence,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, authorize('admin', 'inventory_staff'), getSummary);
router.get('/dashboard-stats', protect, authorize('admin', 'inventory_staff'), getDashboardStats);
router.get('/ledger', protect, authorize('admin', 'inventory_staff'), getLedger);
router.post('/stock-in', protect, authorize('admin', 'inventory_staff'), stockIn);
router.post('/stock-out', protect, authorize('admin', 'inventory_staff'), stockOut);
router.post('/damage', protect, authorize('admin', 'inventory_staff'), recordDamage);
router.post('/adjust', protect, authorize('admin', 'inventory_staff'), adjustStock);
router.get('/reports', protect, authorize('admin', 'inventory_staff'), getReports);
router.get('/intelligence', protect, authorize('admin', 'inventory_staff'), getInventoryIntelligence);

export default router;
