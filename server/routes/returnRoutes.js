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
  createRefundPaymentOrder,
  processRazorpayRefund,
  processReturn,
  assignDeliveryAgentToReturn,
  agentStartPickup,
  agentConfirmPickup,
  agentDeliverToWarehouse,
  uploadEvidenceFile,
} from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadReturnEvidence } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// List returns (role filtered: customer sees theirs, delivery agent sees assigned pickups, staff sees all)
router.get('/', protect, getReturns);

// Check order & item return eligibility (7-day rule, remaining quantity)
router.get('/eligibility/:orderId', protect, getOrderReturnEligibility);

// Upload return evidence image from device
router.post('/upload-evidence', protect, uploadReturnEvidence.single('evidenceImage'), uploadEvidenceFile);

// Single return details
router.get('/:id', protect, getReturnById);

// Customer submits a return request for an eligible item
router.post('/', protect, authorize('customer', 'admin'), createReturn);

// Admin & Inventory Staff return lifecycle transitions
router.put('/:id/review', protect, authorize('admin', 'inventory_staff'), reviewReturn);
router.put('/:id/approve', protect, authorize('admin', 'inventory_staff'), approveReturn);
router.put('/:id/assign-agent', protect, authorize('admin', 'inventory_staff'), assignDeliveryAgentToReturn);
router.put('/:id/reject', protect, authorize('admin', 'inventory_staff'), rejectReturn);
router.put('/:id/receive', protect, authorize('admin', 'inventory_staff'), receiveReturn);
router.put('/:id/inspect', protect, authorize('admin', 'inventory_staff'), inspectReturn);

// Delivery Agent return pickup transitions
router.put(
  '/:id/start-pickup',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  agentStartPickup
);
router.put(
  '/:id/pickup',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  agentConfirmPickup
);
router.put(
  '/:id/deliver-to-warehouse',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin', 'inventory_staff'),
  agentDeliverToWarehouse
);

// Inventory Staff & Admin Razorpay refund initiation (only after inspection OK)
router.post('/:id/create-refund-order', protect, authorize('admin', 'inventory_staff'), createRefundPaymentOrder);
router.post('/:id/refund', protect, authorize('admin', 'inventory_staff'), processRazorpayRefund);

// Legacy/unified process endpoint for backward compatibility
router.put('/:id/process', protect, authorize('admin', 'inventory_staff'), processReturn);

export default router;
