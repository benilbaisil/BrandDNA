import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DeliveryTracking } from '../models/DeliveryTracking.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { logActivity } from '../services/activityService.js';
import {
  createShipmentForOrder,
  syncShipmentToOrder,
  retryShipmentCreation,
} from '../services/shipmentService.js';
import { sendResponse } from '../utils/apiResponse.js';

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;
    const { search, status, paymentStatus, startDate, endDate } = req.query;

    const filter = {};

    // Customer can only view their own orders
    if (role === 'customer') {
      filter.customer = userId;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      filter.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = eDate;
      }
    }

    let orders = await Order.find(filter)
      .populate('customer', 'fullName email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });

    // Search by Order ID, Customer Name, Customer Email, or Shipping Contact
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      orders = orders.filter((o) => {
        const orderNoMatch = o.orderNumber?.toLowerCase().includes(q);
        const customerNameMatch = o.customer?.fullName?.toLowerCase().includes(q);
        const customerEmailMatch = o.customer?.email?.toLowerCase().includes(q);
        const shippingNameMatch = o.shippingAddress?.fullName?.toLowerCase().includes(q);
        return orderNoMatch || customerNameMatch || customerEmailMatch || shippingNameMatch;
      });
    }

    return sendResponse(res, 200, true, 'Orders retrieved successfully', { orders });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch orders');
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    let order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phone')
      .populate('items.product');

    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Ownership check: customers can only view their own orders
    if (role === 'customer') {
      const customerId = order.customer?._id || order.customer;
      if (customerId.toString() !== userId.toString()) {
        return sendResponse(res, 403, false, 'Unauthorized access to order details');
      }
    }

    // Sync shipment if tracking number exists
    if (order.trackingNumber && order.shipmentStatus !== 'DELIVERED') {
      order = await syncShipmentToOrder(order);
      order = await Order.findById(order._id)
        .populate('customer', 'fullName email phone')
        .populate('items.product');
    }

    return sendResponse(res, 200, true, 'Order details retrieved', { order });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch order details');
  }
};

// POST /api/orders (Customer places order -> Stock updated automatically)
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(res, 400, false, 'Order items are required');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return sendResponse(res, 400, false, 'Valid shipping address is required');
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    let totalAmount = 0;
    const formattedItems = [];

    // Verify stock availability for each item first
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendResponse(res, 400, false, `Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        return sendResponse(res, 400, false, `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      const itemTotal = Number(item.quantity) * Number(product.price);
      totalAmount += itemTotal;

      formattedItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        size: item.size || item.selectedSize || '',
        quantity: Number(item.quantity),
        unitPrice: Number(product.price),
        totalPrice: itemTotal,
      });
    }

    const order = await Order.create({
      orderNumber,
      customer: customerId,
      items: formattedItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'Paid',
      status: 'Placed',
    });

    // Automatically decrement stock and log 'Sale' inventory transaction
    for (const item of formattedItems) {
      await recordStockMovement({
        productId: item.product,
        transactionType: 'Sale',
        quantity: item.quantity,
        reference: `Order ${order.orderNumber}`,
        referenceId: order._id,
        userId: customerId,
        notes: `Customer sale order ${order.orderNumber}`,
      });
    }

    // Log System Activity
    await logActivity({
      action: 'Order Placed',
      details: `New order ${order.orderNumber} placed for ₹${totalAmount.toLocaleString('en-IN')}`,
      user: customerId,
      entityType: 'Order',
      entityId: order._id,
    });

    // Create shipment via Demo Shipment API
    await createShipmentForOrder(order);

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'fullName email phone')
      .populate('items.product');

    return sendResponse(res, 201, true, 'Order placed successfully and inventory updated', { order: populatedOrder });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to place order');
  }
};

// PUT /api/orders/:id/status (Admin or Inventory Staff updates order status)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, `Invalid order status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    const prevStatus = order.status;
    order.status = status;
    await order.save();

    await logActivity({
      action: 'Order Status Updated',
      details: `Order ${order.orderNumber} status changed from ${prevStatus} to ${status}`,
      user: req.user?._id || req.user?.id,
      entityType: 'Order',
      entityId: order._id,
    });

    return sendResponse(res, 200, true, `Order status updated to ${status}`, { order });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to update order status');
  }
};

// GET /api/orders/:id/track (Fetches real delivery tracking details read-only)
export const trackOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    let order = await Order.findById(req.params.id)
      .select('+deliveryOtp')
      .populate('customer', 'fullName email phone')
      .populate('deliveryAgent', 'fullName email phone vehicleNumber vehicleType')
      .populate('items.product');

    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Ownership check: customers can only track their own orders
    if (role === 'customer') {
      const customerId = order.customer?._id || order.customer;
      if (customerId.toString() !== userId.toString()) {
        return sendResponse(res, 403, false, 'Unauthorized access to shipment tracking');
      }
    }

    // Ensure tracking number exists
    if (!order.trackingNumber) {
      order = await createShipmentForOrder(order);
    }

    const history = await DeliveryTracking.find({ order: order._id }).sort({ timestamp: 1 });

    let customerOtp = null;
    if (
      (order.status === 'Out for Delivery' || order.status === 'OUT_FOR_DELIVERY') &&
      (role === 'customer' || role === 'admin')
    ) {
      customerOtp = order.deliveryOtp;
    }

    const sanitizedOrder = order.toObject();
    delete sanitizedOrder.deliveryOtp;

    return sendResponse(res, 200, true, 'Shipment tracking data retrieved', {
      order: sanitizedOrder,
      history,
      customerOtp,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch shipment tracking details');
  }
};

// POST /api/orders/:id/retry-shipment (Retry failed shipment creation or sync)
export const retryShipment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await retryShipmentCreation(orderId);

    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('customer', 'fullName email phone')
      .populate('items.product');

    return sendResponse(res, 200, true, 'Shipment retry/sync completed successfully', { order: populatedOrder });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to retry shipment');
  }
};
