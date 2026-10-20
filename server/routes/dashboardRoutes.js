import express from 'express';
import {
  getAdminDashboard,
  getInventoryDashboard,
  getMarketingDashboard,
  getCustomerDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/inventory', protect, authorize('admin', 'inventory_staff'), getInventoryDashboard);
router.get('/marketing', protect, authorize('admin', 'marketing_staff', 'startup_owner'), getMarketingDashboard);
router.get('/customer', protect, authorize('customer', 'admin', 'startup_owner'), getCustomerDashboard);

export default router;
