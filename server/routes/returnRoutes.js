import express from 'express';
import {
  getReturns,
  getReturnById,
  getOrderReturnEligibility,
  createReturn,
  reviewReturn,
  approveReturn,
  rejectReturn,
  receiveReturn,
  inspectReturn,
  processRazorpayRefund,
  processReturn,
} from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// List returns
router.get('/', protect, getReturns);

// Check order & item return eligibility (7-day rule, remaining quantity)
router.get('/eligibility/:orderId', protect, getOrderReturnEligibility);

// Single return details
router.get('/:id', protect, getReturnById);

// Customer submits a return request for an eligible item
router.post('/', protect, authorize('customer', 'admin'), createReturn);

// Admin & Inventory Staff return lifecycle transitions
router.put('/:id/review', protect, authorize('admin', 'inventory_staff'), reviewReturn);
router.put('/:id/approve', protect, authorize('admin', 'inventory_staff'), approveReturn);
router.put('/:id/reject', protect, authorize('admin', 'inventory_staff'), rejectReturn);
router.put('/:id/receive', protect, authorize('admin', 'inventory_staff'), receiveReturn);
router.put('/:id/inspect', protect, authorize('admin', 'inventory_staff'), inspectReturn);

// Inventory Staff & Admin Razorpay refund initiation
router.post('/:id/refund', protect, authorize('admin', 'inventory_staff'), processRazorpayRefund);

// Legacy/unified process endpoint for backward compatibility
router.put('/:id/process', protect, authorize('admin', 'inventory_staff'), processReturn);

export default router;
