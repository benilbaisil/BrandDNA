import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createDeliveryAgent,
  getDeliveryAgents,
  getDeliveryAgentById,
  updateDeliveryAgent,
  toggleDeliveryAgentStatus,
  assignDeliveryAgent,
  reassignDeliveryAgent,
  getAssignedOrders,
  getAgentOrderDetails,
  acceptDelivery,
  pickupOrder,
  startDelivery,
  confirmDeliveryWithOtp,
  failDelivery,
  getAgentDashboardStats,
  toggleAgentAvailability,
  getDeliveryTracking,
} from '../controllers/deliveryController.js';

const router = express.Router();

// Public / Protected Customer & All Authenticated Roles Delivery Tracking
router.get('/tracking/:orderId', protect, getDeliveryTracking);

// ==========================================
// ADMIN & INVENTORY STAFF DELIVERY OPERATIONS
// ==========================================
router.post('/admin/agents', protect, authorize('admin'), createDeliveryAgent);
router.get('/admin/agents', protect, authorize('admin', 'inventory_staff'), getDeliveryAgents);
router.get('/admin/agents/:id', protect, authorize('admin', 'inventory_staff'), getDeliveryAgentById);
router.put('/admin/agents/:id', protect, authorize('admin'), updateDeliveryAgent);
router.patch('/admin/agents/:id/status', protect, authorize('admin'), toggleDeliveryAgentStatus);

router.post('/admin/orders/:orderId/assign', protect, authorize('admin', 'inventory_staff'), assignDeliveryAgent);
router.post('/admin/orders/:orderId/reassign', protect, authorize('admin', 'inventory_staff'), reassignDeliveryAgent);

// ==========================================
// DELIVERY AGENT ROUTES
// ==========================================
router.get(
  '/agent/orders',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  getAssignedOrders
);

router.get(
  '/agent/stats',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  getAgentDashboardStats
);

router.patch(
  '/agent/availability',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  toggleAgentAvailability
);

router.get(
  '/agent/orders/:orderId',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  getAgentOrderDetails
);

router.post(
  '/agent/orders/:orderId/accept',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  acceptDelivery
);

router.post(
  '/agent/orders/:orderId/pickup',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  pickupOrder
);

router.post(
  '/agent/orders/:orderId/start-delivery',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  startDelivery
);

router.post(
  '/agent/orders/:orderId/confirm-delivery',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  confirmDeliveryWithOtp
);

router.post(
  '/agent/orders/:orderId/fail-delivery',
  protect,
  authorize('delivery_agent', 'DELIVERY_AGENT', 'admin'),
  failDelivery
);

export default router;
