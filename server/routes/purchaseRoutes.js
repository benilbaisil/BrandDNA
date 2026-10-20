import express from 'express';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  getSuppliers,
  createSupplier,
} from '../controllers/purchaseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suppliers', protect, authorize('admin', 'inventory_staff'), getSuppliers);
router.post('/suppliers', protect, authorize('admin', 'inventory_staff'), createSupplier);

router.get('/', protect, authorize('admin', 'inventory_staff'), getPurchaseOrders);
router.post('/', protect, authorize('admin', 'inventory_staff'), createPurchaseOrder);
router.put('/:id/receive', protect, authorize('admin', 'inventory_staff'), receivePurchaseOrder);

export default router;
