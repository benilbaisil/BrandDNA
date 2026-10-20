import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { createRazorpayOrder, verifyRazorpaySignature, generateRazorpaySignature } from '../services/razorpayService.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { logActivity } from '../services/activityService.js';
import { createShipmentForOrder } from '../services/shipmentService.js';
import { sendResponse } from '../utils/apiResponse.js';

/**
 * POST /api/payment/create-order
 * Authenticates customer, calculates final order total server-side from DB,
 * converts to paise, and creates a Razorpay order.
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(res, 400, false, 'Order items are required');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return sendResponse(res, 400, false, 'Valid shipping address is required');
    }

    let totalAmount = 0;

    // Verify product existence and stock, and compute total amount server-side
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendResponse(res, 400, false, `Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        return sendResponse(
          res,
          400,
          false,
          `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      totalAmount += Number(item.quantity) * Number(product.price);
    }

    if (totalAmount <= 0) {
      return sendResponse(res, 400, false, 'Order total must be greater than zero');
    }

    // Convert total amount to paise (smallest currency unit for INR)
    const amountInPaise = Math.round(totalAmount * 100);
    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    let razorpayOrderId = null;

    try {
      const razorpayOrder = await createRazorpayOrder({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          customerId: customerId.toString(),
          itemCount: items.length.toString(),
        },
      });
      if (razorpayOrder && razorpayOrder.id) {
        razorpayOrderId = razorpayOrder.id;
      }
    } catch (razorpayErr) {
      const errorMsg = razorpayErr.error?.description || razorpayErr.message || 'Razorpay Authentication Failed';
      console.error('Razorpay Order Creation Error:', errorMsg);
      return sendResponse(
        res,
        400,
        false,
        `Razorpay Gateway Error: ${errorMsg}. Please update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env with valid keys.`
      );
    }

    return sendResponse(res, 200, true, 'Razorpay order prepared successfully', {
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to create Razorpay payment order');
  }
};

/**
 * POST /api/payment/generate-test-signature
 * Helper for Test Mode modal simulation to get server HMAC signature
 */
export const generateTestSignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id) {
      return sendResponse(res, 400, false, 'Missing order_id or payment_id');
    }
    const signature = generateRazorpaySignature({ razorpay_order_id, razorpay_payment_id });
    return sendResponse(res, 200, true, 'Test signature generated', { signature });
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature on server using Key Secret.
 * On successful verification, creates order, updates stock, and logs activity.
 */
export const verifyPayment = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      shippingAddress,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return sendResponse(
        res,
        400,
        false,
        'Missing Razorpay payment verification parameters (payment_id, order_id, signature)'
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(res, 400, false, 'Order items are required for verification');
    }

    // Server-side HMAC-SHA256 signature verification
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      console.warn(`Payment signature verification failed for payment ID: ${razorpay_payment_id}`);
      return sendResponse(res, 400, false, 'Payment verification failed: Invalid signature');
    }

    // Idempotency check: prevent duplicate successful order creation
    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id })
      .populate('customer', 'fullName email phone')
      .populate('items.product');

    if (existingOrder) {
      return sendResponse(res, 200, true, 'Payment already verified and order confirmed', {
        order: existingOrder,
      });
    }

    let totalAmount = 0;
    const formattedItems = [];

    // Verify stock availability again before writing order
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendResponse(res, 400, false, `Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        return sendResponse(
          res,
          400,
          false,
          `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`
        );
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

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    // Create paid order in database
    const order = await Order.create({
      orderNumber,
      customer: customerId,
      items: formattedItems,
      totalAmount,
      shippingAddress: shippingAddress || {
        fullName: req.user?.fullName || 'Customer',
        street: 'Default Address',
        city: 'City',
        state: 'State',
        zipCode: '000000',
        phone: req.user?.phone || '0000000000',
      },
      paymentMethod: 'razorpay',
      paymentStatus: 'Paid',
      status: 'Placed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    });

    // Automatically decrement product stock & record inventory movement
    for (const item of formattedItems) {
      await recordStockMovement({
        productId: item.product,
        transactionType: 'Sale',
        quantity: item.quantity,
        reference: `Order ${order.orderNumber}`,
        referenceId: order._id,
        userId: customerId,
        notes: `Customer Razorpay sale order ${order.orderNumber}`,
      });
    }

    // Log System Activity
    await logActivity({
      action: 'Order Placed (Razorpay)',
      details: `New prepaid order ${order.orderNumber} placed for ₹${totalAmount.toLocaleString('en-IN')} (Razorpay Payment ID: ${razorpay_payment_id})`,
      user: customerId,
      entityType: 'Order',
      entityId: order._id,
    });

    // Automatically create shipment via Demo Shipment API (port 4000)
    await createShipmentForOrder(order);

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'fullName email phone')
      .populate('items.product');

    return sendResponse(res, 201, true, 'Payment verified and order confirmed successfully', {
      order: populatedOrder,
    });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to verify payment');
  }
};
