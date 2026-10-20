import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  trackOrder,
  retryShipment,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/track', protect, trackOrder);
router.post('/', protect, authorize('customer', 'admin'), createOrder);
router.post('/:id/retry-shipment', protect, authorize('admin', 'inventory_staff'), retryShipment);
router.put('/:id/status', protect, authorize('admin', 'inventory_staff'), updateOrderStatus);

export default router;
