import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { DeliveryTracking } from '../models/DeliveryTracking.js';
import { sendResponse } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';
import { validateAndNormalizePhone, validateAddress } from '../validators/contactValidator.js';
import { cache } from '../utils/cache.js';

// Helper to record a delivery tracking timeline event
const recordDeliveryEvent = async ({
  orderId,
  agentId,
  status,
  statusText,
  description,
  location,
  updatedById,
  updatedByName,
  note = '',
}) => {
  try {
    const event = await DeliveryTracking.create({
      order: orderId,
      deliveryAgent: agentId || null,
      status,
      statusText,
      description,
      location: location || 'Dispatch Hub',
      updatedBy: updatedById || null,
      updatedByName: updatedByName || 'System',
      timestamp: new Date(),
      note,
    });

    // Also push to Order.shipmentEvents for backward compatibility
    await Order.findByIdAndUpdate(orderId, {
      $push: {
        shipmentEvents: {
          status,
          statusText,
          description,
          location: location || 'Dispatch Hub',
          timestamp: new Date(),
          updatedBy: updatedByName || 'System',
        },
      },
      shipmentStatus: status,
      shipmentStatusText: statusText,
      shipmentLastSyncedAt: new Date(),
    });

    return event;
  } catch (err) {
    console.error('Error recording delivery event:', err.message);
  }
};

// ==========================================
// ADMIN: DELIVERY AGENT MANAGEMENT
// ==========================================

// POST /api/admin/delivery-agents
export const createDeliveryAgent = async (req, res) => {
  try {
    const { fullName, email, phone, address, password, vehicleNumber, vehicleType, status } = req.body;

    if (!fullName || !email || !password) {
      return sendResponse(res, 400, false, 'Name, email, and password are required');
    }

    if (fullName.trim().length < 2) {
      return sendResponse(res, 400, false, 'Full name must be at least 2 characters');
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User with this email already exists');
    }

    let normalizedPhone = '';
    if (phone && phone.trim()) {
      const phoneRes = validateAndNormalizePhone(phone);
      if (!phoneRes.isValid) {
        return sendResponse(res, 400, false, phoneRes.error);
      }
      normalizedPhone = phoneRes.normalized;
    }

    let sanitizedAddress = { street: '', city: '', state: '', zipCode: '', country: 'India' };
    if (address) {
      const addrRes = validateAddress(address);
      if (!addrRes.isValid) {
        const firstErr = Object.values(addrRes.errors)[0];
        return sendResponse(res, 400, false, firstErr || 'Invalid address provided', addrRes.errors);
      }
      sanitizedAddress = addrRes.sanitized;
    }

    const agent = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: normalizedPhone,
      address: sanitizedAddress,
      password,
      vehicleNumber: (vehicleNumber || '').trim(),
      vehicleType: vehicleType || 'Bike',
      role: 'delivery_agent',
      status: status || 'Active',
    });

    await logActivity({
      action: 'Delivery Agent Created',
      details: `Admin created delivery agent ${agent.fullName} (${agent.email})`,
      user: req.user?._id,
      entityType: 'User',
      entityId: agent._id,
    });

    const sanitizedAgent = {
      _id: agent._id,
      id: agent._id,
      fullName: agent.fullName,
      email: agent.email,
      phone: agent.phone,
      address: agent.address,
      vehicleNumber: agent.vehicleNumber,
      vehicleType: agent.vehicleType,
      role: agent.role,
      status: agent.status,
      createdAt: agent.createdAt,
    };

    return sendResponse(res, 201, true, 'Delivery agent created successfully', { agent: sanitizedAgent });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to create delivery agent');
  }
};

// GET /api/admin/delivery-agents
export const getDeliveryAgents = async (req, res) => {
  try {
    const cacheKey = 'delivery:agents';
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Delivery agents retrieved successfully (instant cache)', cached);
    }

    const rawAgents = await User.find({
      role: { $in: ['delivery_agent', 'DELIVERY_AGENT'] },
      status: { $ne: 'Deleted' },
    }).sort({ createdAt: -1 }).lean();

    // Strictly enforce ONLY Tom and Rahul as active delivery agents
    const agents = rawAgents.filter((a) => {
      const name = (a.fullName || '').toLowerCase();
      return name.includes('tom') || name.includes('rahul');
    });

    // Fetch active assignments count for each agent in parallel
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const [activeCount, completedCount] = await Promise.all([
          Order.countDocuments({
            deliveryAgent: agent._id,
            status: { $in: ['Assigned to Agent', 'ACCEPTED', 'Picked Up', 'Out for Delivery', 'ASSIGNED_TO_AGENT', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
          }),
          Order.countDocuments({
            deliveryAgent: agent._id,
            status: { $in: ['Delivered', 'DELIVERED'] },
          }),
        ]);

        return {
          _id: agent._id,
          id: agent._id,
          fullName: agent.fullName,
          email: agent.email,
          phone: agent.phone,
          vehicleNumber: agent.vehicleNumber || 'N/A',
          vehicleType: agent.vehicleType || 'Bike',
          status: agent.status || 'Active',
          activeDeliveries: activeCount,
          completedDeliveries: completedCount,
          createdAt: agent.createdAt,
        };
      })
    );

    const payload = { agents: agentsWithStats };
    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Delivery agents retrieved successfully', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch delivery agents');
  }
};

// GET /api/admin/delivery-agents/:id
export const getDeliveryAgentById = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || (agent.role !== 'delivery_agent' && agent.role !== 'DELIVERY_AGENT')) {
      return sendResponse(res, 404, false, 'Delivery agent not found');
    }

    const assignedOrders = await Order.find({ deliveryAgent: agent._id })
      .populate('customer', 'fullName email phone')
      .sort({ updatedAt: -1 });

    return sendResponse(
      res,
      200,
      true,
      'Delivery agent details retrieved',
      {
        agent: {
          _id: agent._id,
          id: agent._id,
          fullName: agent.fullName,
          email: agent.email,
          phone: agent.phone,
          vehicleNumber: agent.vehicleNumber,
          vehicleType: agent.vehicleType,
          status: agent.status,
          createdAt: agent.createdAt,
        },
        orders: assignedOrders,
      }
    );
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch delivery agent details');
  }
};

// PUT /api/admin/delivery-agents/:id
export const updateDeliveryAgent = async (req, res) => {
  try {
    const { fullName, email, phone, address, password, vehicleNumber, vehicleType, status } = req.body;
    const agent = await User.findById(req.params.id);

    if (!agent || (agent.role !== 'delivery_agent' && agent.role !== 'DELIVERY_AGENT')) {
      return sendResponse(res, 404, false, 'Delivery agent not found');
    }

    if (fullName) {
      if (fullName.trim().length < 2) {
        return sendResponse(res, 400, false, 'Full name must be at least 2 characters');
      }
      agent.fullName = fullName.trim();
    }

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== agent.email) {
        const existing = await User.findOne({ email: cleanEmail, _id: { $ne: agent._id } });
        if (existing) {
          return sendResponse(res, 400, false, 'User with this email already exists');
        }
        agent.email = cleanEmail;
      }
    }

    if (phone !== undefined) {
      if (phone && phone.trim()) {
        const phoneRes = validateAndNormalizePhone(phone);
        if (!phoneRes.isValid) {
          return sendResponse(res, 400, false, phoneRes.error);
        }
        agent.phone = phoneRes.normalized;
      } else {
        agent.phone = '';
      }
    }

    if (address !== undefined) {
      if (address && (address.street || address.city || address.zipCode)) {
        const addrRes = validateAddress(address);
        if (!addrRes.isValid) {
          const firstErr = Object.values(addrRes.errors)[0];
          return sendResponse(res, 400, false, firstErr || 'Invalid address provided', addrRes.errors);
        }
        agent.address = addrRes.sanitized;
      }
    }

    if (vehicleNumber !== undefined) agent.vehicleNumber = (vehicleNumber || '').trim();
    if (vehicleType !== undefined) agent.vehicleType = vehicleType;
    if (status) agent.status = status;
    if (password && password.trim().length >= 6) {
      agent.password = password.trim();
    }

    await agent.save();

    return sendResponse(res, 200, true, 'Delivery agent details updated successfully', {
      agent: {
        _id: agent._id,
        id: agent._id,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.phone,
        address: agent.address,
        vehicleNumber: agent.vehicleNumber,
        vehicleType: agent.vehicleType,
        status: agent.status,
      },
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to update delivery agent');
  }
};

// PATCH /api/admin/delivery-agents/:id/status
export const toggleDeliveryAgentStatus = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || (agent.role !== 'delivery_agent' && agent.role !== 'DELIVERY_AGENT')) {
      return sendResponse(res, 404, false, 'Delivery agent not found');
    }

    agent.status = agent.status === 'Active' ? 'Disabled' : 'Active';
    await agent.save();

    return sendResponse(res, 200, true, `Agent status updated to ${agent.status}`, {
      agentId: agent._id,
      status: agent.status,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to toggle status');
  }
};

// ==========================================
// ADMIN: ORDER ASSIGNMENT & REASSIGNMENT
// ==========================================

// POST /api/admin/orders/:orderId/assign-delivery-agent
export const assignDeliveryAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryAgentId = req.body.deliveryAgentId || req.body.agentId;

    if (!deliveryAgentId) {
      return sendResponse(res, 400, false, 'Delivery Agent ID is required');
    }

    const agent = await User.findById(deliveryAgentId);
    if (!agent || (agent.role !== 'delivery_agent' && agent.role !== 'DELIVERY_AGENT')) {
      return sendResponse(res, 404, false, 'Delivery Agent not found');
    }

    if (agent.status !== 'Active') {
      return sendResponse(res, 400, false, 'Cannot assign delivery to an inactive/disabled agent');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    if (['Delivered', 'Cancelled', 'DELIVERED'].includes(order.status)) {
      return sendResponse(res, 400, false, `Cannot assign agent to order in status: ${order.status}`);
    }

    order.deliveryAgent = agent._id;
    order.status = 'Assigned to Agent';
    order.assignedAt = new Date();
    await order.save();

    await recordDeliveryEvent({
      orderId: order._id,
      agentId: agent._id,
      status: 'Assigned to Agent',
      statusText: 'Assigned to Delivery Agent',
      description: `Order assigned to delivery agent ${agent.fullName} (${agent.phone || agent.email})`,
      location: order.shippingAddress?.city || 'Central Warehouse',
      updatedById: req.user?._id,
      updatedByName: req.user?.fullName || 'System Admin',
    });

    await logActivity({
      action: 'Delivery Agent Assigned',
      details: `Order ${order.orderNumber} assigned to agent ${agent.fullName}`,
      user: req.user?._id,
      entityType: 'Order',
      entityId: order._id,
    });

    const populated = await Order.findById(order._id)
      .populate('customer', 'fullName email phone')
      .populate('deliveryAgent', 'fullName email phone vehicleNumber vehicleType');

    return sendResponse(res, 200, true, 'Delivery agent assigned successfully', { order: populated });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to assign delivery agent');
  }
};

// POST /api/admin/orders/:orderId/reassign-delivery-agent
export const reassignDeliveryAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryAgentId = req.body.deliveryAgentId || req.body.agentId;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    if (deliveryAgentId) {
      const agent = await User.findById(deliveryAgentId);
      if (!agent || agent.status !== 'Active') {
        return sendResponse(res, 400, false, 'Selected agent is invalid or inactive');
      }

      order.deliveryAgent = agent._id;
      order.status = 'Assigned to Agent';
      order.assignedAt = new Date();
      order.deliveryFailureReason = null;
      order.deliveryFailureNote = null;
      await order.save();

      await recordDeliveryEvent({
        orderId: order._id,
        agentId: agent._id,
        status: 'Assigned to Agent',
        statusText: 'Reassigned to Delivery Agent',
        description: `Order reassigned to delivery agent ${agent.fullName}`,
        location: order.shippingAddress?.city || 'Central Warehouse',
        updatedById: req.user?._id,
        updatedByName: req.user?.fullName || 'System Admin',
        note: 'Reassigned after previous failure',
      });
    } else {
      order.status = 'Ready for Pickup';
      order.deliveryAgent = null;
      order.deliveryFailureReason = null;
      order.deliveryFailureNote = null;
      await order.save();

      await recordDeliveryEvent({
        orderId: order._id,
        status: 'Ready for Pickup',
        statusText: 'Reset to Ready for Pickup',
        description: 'Order reset to Ready for Pickup status by Admin for reassignment',
        location: order.shippingAddress?.city || 'Central Warehouse',
        updatedById: req.user?._id,
        updatedByName: req.user?.fullName || 'System Admin',
      });
    }

    const populated = await Order.findById(order._id)
      .populate('customer', 'fullName email phone')
      .populate('deliveryAgent', 'fullName email phone vehicleNumber vehicleType');

    return sendResponse(res, 200, true, 'Delivery reassignment updated', { order: populated });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to reassign delivery');
  }
};

// ==========================================
// DELIVERY AGENT OPERATIONS
// ==========================================

// GET /api/delivery/orders
export const getAssignedOrders = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { status } = req.query;

    const cacheKey = `delivery:assigned:${agentId}:${status || ''}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Assigned deliveries retrieved (instant cache)', cached);
    }

    const filter = { deliveryAgent: agentId };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'fullName email phone')
      .populate('items.product')
      .sort({ updatedAt: -1 })
      .lean();

    const payload = { orders };
    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Assigned deliveries retrieved', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch assigned deliveries');
  }
};

// GET /api/delivery/orders/:orderId
export const getAgentOrderDetails = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer', 'fullName email phone')
      .populate('items.product');

    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Ownership check: verify assigned agent
    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId.toString()) {
      return sendResponse(res, 403, false, 'Forbidden: This delivery is not assigned to you');
    }

    const history = await DeliveryTracking.find({ order: order._id }).sort({ timestamp: 1 });

    return sendResponse(res, 200, true, 'Order details retrieved', { order, history });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch order details');
  }
};

// POST /api/delivery/orders/:orderId/accept
export const acceptDelivery = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId.toString()) {
      return sendResponse(res, 403, false, 'Forbidden: Order is not assigned to you');
    }

    order.acceptedAt = new Date();
    order.status = 'Assigned to Agent';
    await order.save();

    await recordDeliveryEvent({
      orderId: order._id,
      agentId,
      status: 'Assigned to Agent',
      statusText: 'Accepted by Delivery Agent',
      description: `${req.user?.fullName || 'Delivery Agent'} accepted the delivery request`,
      location: 'Dispatch Hub',
      updatedById: agentId,
      updatedByName: req.user?.fullName || 'Delivery Agent',
    });

    return sendResponse(res, 200, true, 'Delivery accepted', { order });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to accept delivery');
  }
};

// POST /api/delivery/orders/:orderId/pickup
export const pickupOrder = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId.toString()) {
      return sendResponse(res, 403, false, 'Forbidden: Order is not assigned to you');
    }

    if (!order.acceptedAt) {
      return sendResponse(res, 400, false, 'Order must be accepted before picking up');
    }

    order.status = 'Picked Up';
    order.pickedUpAt = new Date();
    await order.save();

    await recordDeliveryEvent({
      orderId: order._id,
      agentId,
      status: 'Picked Up',
      statusText: 'Picked Up by Delivery Agent',
      description: `Package picked up from hub by ${req.user?.fullName}`,
      location: 'Main Warehouse Hub',
      updatedById: agentId,
      updatedByName: req.user?.fullName || 'Delivery Agent',
    });

    return sendResponse(res, 200, true, 'Order marked as Picked Up', { order });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to update pickup status');
  }
};

// POST /api/delivery/orders/:orderId/start-delivery
export const startDelivery = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId.toString()) {
      return sendResponse(res, 403, false, 'Forbidden: Order is not assigned to you');
    }

    if (order.status !== 'Picked Up' && order.status !== 'PICKED_UP') {
      return sendResponse(res, 400, false, 'Order must be Picked Up before starting delivery');
    }

    // Generate 6-digit delivery OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Valid 24h

    order.status = 'Out for Delivery';
    order.outForDeliveryAt = new Date();
    order.deliveryOtp = generatedOtp;
    order.deliveryOtpExpiresAt = otpExpiry;
    await order.save();

    await recordDeliveryEvent({
      orderId: order._id,
      agentId,
      status: 'Out for Delivery',
      statusText: 'Out for Delivery',
      description: `Package is out for delivery with ${req.user?.fullName}. Verification OTP issued to customer.`,
      location: order.shippingAddress?.city || 'Local Delivery Area',
      updatedById: agentId,
      updatedByName: req.user?.fullName || 'Delivery Agent',
    });

    return sendResponse(res, 200, true, 'Delivery started! Order is Out for Delivery', { order });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to start delivery');
  }
};

// POST /api/delivery/orders/:orderId/confirm-delivery
export const confirmDeliveryWithOtp = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { orderId } = req.params;
    const { otp, note } = req.body;

    if (!otp || otp.trim() === '') {
      return sendResponse(res, 400, false, 'Customer OTP is required');
    }

    // Query order with +deliveryOtp
    const order = await Order.findById(orderId).select('+deliveryOtp');
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId.toString()) {
      return sendResponse(res, 403, false, 'Forbidden: Order is not assigned to you');
    }

    if (order.status !== 'Out for Delivery' && order.status !== 'OUT_FOR_DELIVERY') {
      return sendResponse(res, 400, false, 'Order must be Out for Delivery before completing delivery');
    }

    // Verify OTP
    if (!order.deliveryOtp || order.deliveryOtp.trim() !== otp.trim()) {
      return sendResponse(res, 400, false, 'Invalid OTP. Delivery cannot be completed.');
    }

    order.status = 'Delivered';
    order.deliveredAt = new Date();
    order.paymentStatus = 'Paid'; // Mark paid upon successful delivery
    order.deliveryOtp = null; // Clear OTP after use
    await order.save();

    await recordDeliveryEvent({
      orderId: order._id,
      agentId,
      status: 'Delivered',
      statusText: 'Delivered',
      description: `Package successfully delivered to customer by ${req.user?.fullName}. Verified via OTP.`,
      location: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`,
      updatedById: agentId,
      updatedByName: req.user?.fullName || 'Delivery Agent',
      note: note || '',
    });

    await logActivity({
      action: 'Order Delivered',
      details: `Order ${order.orderNumber} marked Delivered by agent ${req.user?.fullName}`,
      user: agentId,
      entityType: 'Order',
      entityId: order._id,
    });

    return sendResponse(res, 200, true, 'Delivery confirmed and order marked as Delivered!', { order });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to confirm delivery');
  }
};

// POST /api/delivery/orders/:orderId/fail-delivery
export const failDelivery = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const { orderId } = req.params;
    const { reason, note } = req.body;

    if (!reason || reason.trim() === '') {
      return sendResponse(res, 400, false, 'Failure reason is required');
    }

    const order = await Order.findById(orderId);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (!order.deliveryAgent || order.deliveryAgent.toString() !== agentId.toString()) {
      return sendResponse(res, 403, false, 'Forbidden: Order is not assigned to you');
    }

    order.status = 'Delivery Failed';
    order.failedAt = new Date();
    order.deliveryFailureReason = reason;
    order.deliveryFailureNote = note || '';
    await order.save();

    await recordDeliveryEvent({
      orderId: order._id,
      agentId,
      status: 'Delivery Failed',
      statusText: 'Delivery Failed',
      description: `Delivery attempt failed. Reason: ${reason}`,
      location: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`,
      updatedById: agentId,
      updatedByName: req.user?.fullName || 'Delivery Agent',
      note: note || '',
    });

    return sendResponse(res, 200, true, 'Delivery failure recorded', { order });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to record delivery failure');
  }
};

// PATCH /api/delivery/agent/availability
export const toggleAgentAvailability = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const agent = await User.findById(agentId);

    if (!agent) return sendResponse(res, 404, false, 'Agent not found');

    agent.availabilityStatus = agent.availabilityStatus === 'Available' ? 'Unavailable' : 'Available';
    await agent.save();

    return sendResponse(res, 200, true, `Availability updated to ${agent.availabilityStatus}`, {
      availabilityStatus: agent.availabilityStatus,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to update availability');
  }
};

// GET /api/delivery/dashboard-stats
export const getAgentDashboardStats = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const cacheKey = `delivery:stats:${agentId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Agent dashboard stats retrieved (instant cache)', cached);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      agentUser,
      todaysDeliveries,
      pendingDeliveries,
      deliveredToday,
      totalDelivered,
      failedDeliveries
    ] = await Promise.all([
      User.findById(agentId).select('availabilityStatus').lean(),
      Order.countDocuments({
        deliveryAgent: agentId,
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      Order.countDocuments({
        deliveryAgent: agentId,
        status: {
          $in: [
            'Assigned to Agent',
            'ACCEPTED',
            'Picked Up',
            'Out for Delivery',
            'ASSIGNED_TO_AGENT',
            'PICKED_UP',
            'OUT_FOR_DELIVERY',
          ],
        },
      }),
      Order.countDocuments({
        deliveryAgent: agentId,
        status: { $in: ['Delivered', 'DELIVERED'] },
        deliveredAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      Order.countDocuments({
        deliveryAgent: agentId,
        status: { $in: ['Delivered', 'DELIVERED'] },
      }),
      Order.countDocuments({
        deliveryAgent: agentId,
        status: { $in: ['Delivery Failed', 'DELIVERY_FAILED'] },
      })
    ]);

    const totalProcessed = totalDelivered + failedDeliveries;
    const completionRate = totalProcessed > 0 ? Math.round((totalDelivered / totalProcessed) * 100) : 100;

    const payload = {
      todaysDeliveries,
      pendingDeliveries,
      deliveredToday,
      totalDelivered,
      failedDeliveries,
      completionRate,
      availabilityStatus: agentUser?.availabilityStatus || 'Available',
    };

    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Agent dashboard stats retrieved', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch dashboard stats');
  }
};

// ==========================================
// CUSTOMER & PUBLIC TRACKING
// ==========================================

// GET /api/orders/:orderId/delivery-tracking
export const getDeliveryTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    // Need +deliveryOtp if status is Out for Delivery and requested by customer
    const order = await Order.findById(orderId)
      .select('+deliveryOtp')
      .populate('customer', 'fullName email phone')
      .populate('deliveryAgent', 'fullName email phone vehicleNumber vehicleType');

    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Customer ownership check
    if (role === 'customer') {
      const custId = order.customer?._id || order.customer;
      if (custId.toString() !== userId.toString()) {
        return sendResponse(res, 403, false, 'Unauthorized to view tracking for this order');
      }
    }

    const history = await DeliveryTracking.find({ order: order._id }).sort({ timestamp: 1 });

    // Expose OTP ONLY if caller is the Customer or Admin, and order is Out for Delivery
    let customerOtp = null;
    if (
      (order.status === 'Out for Delivery' || order.status === 'OUT_FOR_DELIVERY') &&
      (role === 'customer' || role === 'admin')
    ) {
      customerOtp = order.deliveryOtp;
    }

    const sanitizedOrder = order.toObject();
    delete sanitizedOrder.deliveryOtp; // Strip from order object

    return sendResponse(res, 200, true, 'Delivery tracking retrieved', {
      order: sanitizedOrder,
      history,
      customerOtp,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch delivery tracking');
  }
};
