import { Return } from '../models/Return.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { createRazorpayRefund, createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { sendResponse } from '../utils/apiResponse.js';
import { cache } from '../utils/cache.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Helper: Calculate 7-day return deadline from delivery timestamp
 */
export const calculateReturnDeadline = (deliveredAt) => {
  if (!deliveredAt) return null;
  const deliveryDate = new Date(deliveredAt);
  if (isNaN(deliveryDate.getTime())) return null;
  return new Date(deliveryDate.getTime() + SEVEN_DAYS_MS);
};

/**
 * GET /api/returns
 * List return requests with role-based filtering
 */
export const getReturns = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;
    const cacheKey = `returns:${role || 'all'}:${role === 'customer' || role === 'delivery_agent' || role === 'DELIVERY_AGENT' ? userId : 'all'}:${req.query.orderId || ''}:${req.query.status || ''}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Returns retrieved successfully (instant cache)', cached);
    }

    const filter = {};
    if (role === 'customer') {
      filter.customer = userId;
    } else if (role === 'delivery_agent' || role === 'DELIVERY_AGENT') {
      filter.assignedDeliveryAgent = userId;
    } else if (req.query.assignedDeliveryAgent) {
      filter.assignedDeliveryAgent = req.query.assignedDeliveryAgent;
    } else if (req.query.orderId) {
      filter.order = req.query.orderId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const returns = await Return.find(filter)
      .populate('order', 'orderNumber status paymentStatus totalAmount razorpayPaymentId deliveredAt createdAt shippingAddress')
      .populate('customer', 'fullName email phone address')
      .populate('product', 'name sku price stock images category')
      .populate('assignedDeliveryAgent', 'fullName email phone vehicleNumber vehicleType availabilityStatus')
      .populate('inspectedBy', 'fullName email role')
      .populate('statusHistory.changedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .lean();

    const payload = { returns };
    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Returns retrieved successfully', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch returns');
  }
};

/**
 * GET /api/returns/:id
 * Retrieve a specific return request by ID
 */
export const getReturnById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    const returnDoc = await Return.findById(req.params.id)
      .populate('order')
      .populate('customer', 'fullName email phone address')
      .populate('product')
      .populate('assignedDeliveryAgent', 'fullName email phone vehicleNumber vehicleType availabilityStatus')
      .populate('inspectedBy', 'fullName email role')
      .populate('statusHistory.changedBy', 'fullName role');

    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (role === 'customer' && returnDoc.customer._id.toString() !== userId.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized to view this return request');
    }

    return sendResponse(res, 200, true, 'Return request details retrieved', { returnDoc });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch return details');
  }
};

/**
 * GET /api/returns/eligibility/:orderId
 * Check return eligibility for each item in an order based on delivery timestamp and 7-day limit
 */
export const getOrderReturnEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    const order = await Order.findById(orderId).populate('items.product', 'name sku price images');
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Role check: customer can only query their own order
    if (role === 'customer' && order.customer.toString() !== userId.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized to view eligibility for this order');
    }

    const isDelivered =
      order.status === 'Delivered' ||
      order.status === 'DELIVERED' ||
      order.shipmentStatusText?.toUpperCase() === 'DELIVERED' ||
      order.shipmentStatus?.toUpperCase() === 'DELIVERED';

    const isPaid = order.paymentStatus === 'Paid';
    const deliveredAt = order.deliveredAt;
    const returnDeadline = deliveredAt ? calculateReturnDeadline(deliveredAt) : null;
    const now = Date.now();

    const isWithin7Days = !!(
      isDelivered &&
      deliveredAt &&
      returnDeadline &&
      now <= returnDeadline.getTime()
    );

    const isExpired = !!(
      isDelivered &&
      deliveredAt &&
      returnDeadline &&
      now > returnDeadline.getTime()
    );

    const daysRemaining =
      isWithin7Days && returnDeadline
        ? Math.max(0, Math.ceil((returnDeadline.getTime() - now) / (1000 * 60 * 60 * 24)))
        : 0;

    // Fetch all existing returns for this order
    const existingReturns = await Return.find({ order: orderId });

    // Calculate product-level eligibility
    const itemEligibility = (order.items || []).map((item) => {
      const prodIdStr = (item.product?._id || item.product).toString();

      // Find returns for this specific product
      const itemReturns = existingReturns.filter(
        (r) => r.product.toString() === prodIdStr && !['REJECTED', 'Rejected'].includes(r.status)
      );

      const alreadyReturnedQty = itemReturns.reduce((sum, r) => sum + (r.quantity || 0), 0);
      const remainingReturnableQty = Math.max(0, item.quantity - alreadyReturnedQty);

      // Latest return info for this item
      const latestReturn = existingReturns
        .filter((r) => r.product.toString() === prodIdStr)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

      const isEligible = isWithin7Days && isPaid && remainingReturnableQty > 0;

      let reasonNotEligible = '';
      if (!isDelivered) {
        reasonNotEligible = 'Order is not delivered yet.';
      } else if (!isPaid) {
        reasonNotEligible = 'Order payment has not been completed.';
      } else if (!deliveredAt) {
        reasonNotEligible = 'No delivery record found.';
      } else if (isExpired) {
        reasonNotEligible = 'Return period expired (7 days).';
      } else if (remainingReturnableQty <= 0) {
        reasonNotEligible = 'All purchased units of this item have already been returned.';
      }

      return {
        productId: prodIdStr,
        productName: item.productName || item.product?.name,
        productImage: item.productImage || item.product?.images?.[0] || '',
        size: item.size || '',
        purchasedQty: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        alreadyReturnedQty,
        remainingReturnableQty,
        isEligible,
        reasonNotEligible,
        latestReturn: latestReturn
          ? {
              _id: latestReturn._id,
              returnNumber: latestReturn.returnNumber,
              status: latestReturn.status,
              inspectStatus: latestReturn.inspectStatus,
              refundStatus: latestReturn.refundStatus,
              quantity: latestReturn.quantity,
              reason: latestReturn.reason,
            }
          : null,
      };
    });

    return sendResponse(res, 200, true, 'Order return eligibility calculated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      deliveredAt,
      returnDeadline,
      isDelivered,
      isWithin7Days,
      isExpired,
      daysRemaining,
      items: itemEligibility,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to check return eligibility');
  }
};

/**
 * POST /api/returns (Customer creates return request)
 * Strict 7-day validation & product-level quantity limits
 */
export const createReturn = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    const { orderId, productId, quantity, reason, description, evidenceImage } = req.body;

    if (!orderId || !productId || !reason) {
      return sendResponse(res, 400, false, 'orderId, productId, and return reason are required');
    }

    // Canonical return reasons: 'Damaged', 'Mismatch size', 'Not as expected quality'
    let normalizedReason = reason.trim();
    const reasonLower = normalizedReason.toLowerCase();
    if (reasonLower.includes('damag') || reasonLower.includes('defect')) {
      normalizedReason = 'Damaged';
    } else if (reasonLower.includes('size') || reasonLower.includes('wrong') || reasonLower.includes('mismatch')) {
      normalizedReason = 'Mismatch size';
    } else if (reasonLower.includes('qualit') || reasonLower.includes('expect')) {
      normalizedReason = 'Not as expected quality';
    }

    const reqQty = Number(quantity || 1);
    if (isNaN(reqQty) || reqQty <= 0) {
      return sendResponse(res, 400, false, 'Return quantity must be a positive number');
    }

    // 1. Fetch Order and verify customer ownership
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    if (order.customer.toString() !== customerId.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized: You can only return items from your own orders');
    }

    // 2. Verify Order Delivery status
    const isDelivered =
      order.status === 'Delivered' ||
      order.status === 'DELIVERED' ||
      order.shipmentStatusText?.toUpperCase() === 'DELIVERED' ||
      order.shipmentStatus?.toUpperCase() === 'DELIVERED';

    if (!isDelivered) {
      return sendResponse(res, 400, false, 'Return rejected: Order has not been delivered yet');
    }

    if (order.paymentStatus !== 'Paid') {
      return sendResponse(res, 400, false, 'Return rejected: Order payment has not been completed');
    }

    // 3. Strict 7-Day Deadline Enforcement using database deliveredAt
    if (!order.deliveredAt) {
      return sendResponse(
        res,
        400,
        false,
        'Return rejected: No valid delivery timestamp exists for this order'
      );
    }

    const deliveryTime = new Date(order.deliveredAt).getTime();
    if (isNaN(deliveryTime)) {
      return sendResponse(res, 400, false, 'Return rejected: Invalid delivery timestamp recorded');
    }

    const returnDeadline = new Date(deliveryTime + SEVEN_DAYS_MS);
    const now = Date.now();

    if (now > returnDeadline.getTime()) {
      return sendResponse(
        res,
        400,
        false,
        `Return period expired (7 days). Delivery was completed on ${new Date(
          deliveryTime
        ).toLocaleDateString()}, and the 7-day return window ended on ${returnDeadline.toLocaleDateString()}.`
      );
    }

    // 4. Verify Product exists in Order
    const orderItem = order.items.find(
      (item) => (item.product?._id || item.product).toString() === productId.toString()
    );

    if (!orderItem) {
      return sendResponse(res, 404, false, 'The specified product was not found in this order');
    }

    // 5. Verify Quantity against previously requested/approved returns for this product in this order
    const existingReturns = await Return.find({
      order: orderId,
      product: productId,
      status: { $nin: ['REJECTED', 'Rejected'] },
    });

    const alreadyReturnedQty = existingReturns.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const remainingReturnableQty = orderItem.quantity - alreadyReturnedQty;

    if (remainingReturnableQty <= 0) {
      return sendResponse(
        res,
        400,
        false,
        'All purchased units of this product have already been returned or have an active return request'
      );
    }

    if (reqQty > remainingReturnableQty) {
      return sendResponse(
        res,
        400,
        false,
        `Requested quantity (${reqQty}) exceeds the remaining returnable quantity (${remainingReturnableQty}) for this item`
      );
    }

    // 6. Generate Return Number and persist Return document
    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;
    const unitPrice = orderItem.unitPrice || 0;
    const refundAmount = reqQty * unitPrice;

    const returnDoc = await Return.create({
      returnNumber,
      order: orderId,
      customer: customerId,
      product: productId,
      productName: orderItem.productName || orderItem.product?.name || 'Product Item',
      productImage: orderItem.productImage || orderItem.product?.images?.[0] || '',
      size: orderItem.size || '',
      quantity: reqQty,
      unitPrice,
      refundAmount,
      reason: normalizedReason,
      description: description || '',
      evidenceImage: evidenceImage || '',
      status: 'RETURN_REQUESTED',
      inspectStatus: 'PendingInspection',
      refundStatus: 'Pending',
      deliveredAt: order.deliveredAt,
      returnDeadline,
      statusHistory: [
        {
          status: 'RETURN_REQUESTED',
          changedBy: customerId,
          note: `Customer requested return for ${reqQty} unit(s). Reason: ${reason}`,
          timestamp: new Date(),
        },
      ],
    });

    return sendResponse(res, 201, true, 'Return request submitted successfully', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create return request');
  }
};

/**
 * PUT /api/returns/:id/review
 * Transition return to UNDER_REVIEW (Admin / Inventory Staff)
 */
export const reviewReturn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { note } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    returnDoc.status = 'UNDER_REVIEW';
    returnDoc.statusHistory.push({
      status: 'UNDER_REVIEW',
      changedBy: userId,
      note: note || 'Return request marked under review by staff',
      timestamp: new Date(),
    });

    await returnDoc.save();

    return sendResponse(res, 200, true, 'Return request moved to UNDER_REVIEW', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to update return status');
  }
};

/**
 * PUT /api/returns/:id/approve
 * Admin / Inventory Staff approves return request
 */
export const approveReturn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { note } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (returnDoc.status === 'REJECTED' || returnDoc.status === 'Rejected') {
      return sendResponse(res, 400, false, 'Cannot approve a return that was already rejected');
    }

    const targetStatus = returnDoc.assignedDeliveryAgent ? 'PICKUP_ASSIGNED' : 'APPROVED';
    returnDoc.status = targetStatus;
    returnDoc.statusHistory.push({
      status: targetStatus,
      changedBy: userId,
      note: note || (returnDoc.assignedDeliveryAgent ? 'Return request approved (pickup assigned)' : 'Return request approved by staff'),
      timestamp: new Date(),
    });

    await returnDoc.save();
    cache.invalidatePrefix('returns:');
    cache.flush();

    return sendResponse(res, 200, true, 'Return request approved successfully', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to approve return');
  }
};

/**
 * PUT /api/returns/:id/assign-agent
 * Admin / Inventory Staff assigns a delivery agent to pick up approved return
 */
export const assignDeliveryAgentToReturn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { deliveryAgentId, notes } = req.body;

    if (!deliveryAgentId) {
      return sendResponse(res, 400, false, 'Delivery agent ID is required');
    }

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    // Must be in APPROVED or PICKUP_ASSIGNED status
    if (!['APPROVED', 'Approved', 'PICKUP_ASSIGNED'].includes(returnDoc.status)) {
      return sendResponse(res, 400, false, 'Return must be approved before assigning a delivery agent');
    }

    const agent = await User.findById(deliveryAgentId);
    if (!agent || !['delivery_agent', 'DELIVERY_AGENT'].includes(agent.role)) {
      return sendResponse(res, 404, false, 'Selected user is not a valid delivery agent');
    }

    returnDoc.assignedDeliveryAgent = agent._id;
    returnDoc.assignedAt = new Date();
    returnDoc.status = 'PICKUP_ASSIGNED';

    returnDoc.statusHistory.push({
      status: 'PICKUP_ASSIGNED',
      changedBy: userId,
      note: `Assigned to delivery agent ${agent.fullName}${notes ? ' - ' + notes : ''}`,
      timestamp: new Date(),
    });

    await returnDoc.save();
    cache.invalidatePrefix('returns:');
    cache.flush();

    const populatedReturn = await Return.findById(returnDoc._id)
      .populate('order', 'orderNumber status paymentStatus totalAmount razorpayPaymentId deliveredAt createdAt shippingAddress')
      .populate('customer', 'fullName email phone address')
      .populate('product', 'name sku price stock images category')
      .populate('assignedDeliveryAgent', 'fullName email phone vehicleNumber vehicleType availabilityStatus');

    return sendResponse(res, 200, true, `Assigned return pickup to ${agent.fullName}`, {
      returnDoc: populatedReturn,
    });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to assign delivery agent');
  }
};

/**
 * PUT /api/returns/:id/start-pickup
 * Delivery Agent marks pickup as en route / started
 */
export const agentStartPickup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { note } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (req.user?.role !== 'admin' && returnDoc.assignedDeliveryAgent?.toString() !== userId.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized: You are not assigned to this return pickup');
    }

    returnDoc.status = 'OUT_FOR_PICKUP';
    returnDoc.statusHistory.push({
      status: 'OUT_FOR_PICKUP',
      changedBy: userId,
      note: note || 'Delivery agent is en route for customer pickup',
      timestamp: new Date(),
    });

    await returnDoc.save();
    cache.invalidatePrefix('returns:');
    cache.flush();

    return sendResponse(res, 200, true, 'Return marked OUT_FOR_PICKUP', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to start pickup');
  }
};

/**
 * PUT /api/returns/:id/pickup
 * Delivery Agent confirms pickup of product from customer
 */
export const agentConfirmPickup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { note } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (req.user?.role !== 'admin' && returnDoc.assignedDeliveryAgent?.toString() !== userId.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized: You are not assigned to this return pickup');
    }

    returnDoc.status = 'PICKED_UP';
    returnDoc.pickedUpAt = new Date();
    returnDoc.statusHistory.push({
      status: 'PICKED_UP',
      changedBy: userId,
      note: note || 'Product collected from customer address by delivery agent',
      timestamp: new Date(),
    });

    await returnDoc.save();
    cache.invalidatePrefix('returns:');
    cache.flush();

    return sendResponse(res, 200, true, 'Product successfully picked up from customer', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to confirm pickup');
  }
};

/**
 * Helper: Process inventory stock update when returned product arrives at warehouse / inventory.
 * - If product is damaged (reason is 'Damaged' or contains 'damage'), it should NOT add to stock.
 *   Audit ledger records damage with adjustStock: false.
 * - Otherwise (e.g. "Mismatch size", "Not as expected quality"), when the returned product
 *   comes to inventory, stock is updated (+quantity).
 */
export const processArrivalAtInventory = async (returnDoc, userId, note = '') => {
  const isDamaged =
    returnDoc.reason === 'Damaged' ||
    (returnDoc.reason || '').toLowerCase().includes('damag') ||
    returnDoc.inspectStatus === 'Damaged';

  if (isDamaged) {
    // Damaged product: Do NOT add to sellable stock
    returnDoc.isStockAdjusted = false;
    try {
      await recordStockMovement({
        productId: returnDoc.product,
        transactionType: 'Damage',
        quantity: returnDoc.quantity,
        reference: `Damaged Return ${returnDoc.returnNumber}`,
        referenceId: returnDoc._id,
        userId,
        notes: `Returned item arrived at inventory damaged — not added to sellable stock (${returnDoc.returnNumber})${
          note ? ' - ' + note : ''
        }`,
        adjustStock: false,
      });
    } catch (err) {
      console.warn('⚠️ Damage ledger record notice:', err.message);
    }
  } else {
    // Non-damaged product ("Mismatch size", "Not as expected quality"):
    // When the returned product comes to inventory, update stock (+quantity)
    if (!returnDoc.isStockAdjusted) {
      try {
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Return',
          quantity: returnDoc.quantity,
          reference: `Return Arrival ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Stock updated upon arrival at inventory (${returnDoc.returnNumber} - ${returnDoc.reason})${
            note ? ' - ' + note : ''
          }`,
          adjustStock: true,
        });
        returnDoc.isStockAdjusted = true;
      } catch (err) {
        console.warn('⚠️ Stock adjustment error upon arrival at inventory:', err.message);
      }
    }
  }
};

/**
 * PUT /api/returns/:id/deliver-to-warehouse
 * Delivery Agent / Staff delivers returned product to warehouse
 */
export const agentDeliverToWarehouse = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { note } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    returnDoc.status = 'RETURN_RECEIVED';
    returnDoc.receivedAt = new Date();
    returnDoc.statusHistory.push({
      status: 'RETURN_RECEIVED',
      changedBy: userId,
      note: note || 'Returned product delivered to warehouse and ready for inspection',
      timestamp: new Date(),
    });

    // Update stock when returned product comes to inventory (if not damaged)
    await processArrivalAtInventory(returnDoc, userId, note);

    await returnDoc.save();
    cache.invalidatePrefix('returns:');
    cache.flush();

    return sendResponse(res, 200, true, 'Product received at warehouse for inspection', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to deliver to warehouse');
  }
};

/**
 * PUT /api/returns/:id/reject
 * Admin / Inventory Staff rejects return request with mandatory rejection reason
 */
export const rejectReturn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { rejectionReason, note } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return sendResponse(res, 400, false, 'A rejection reason is required to reject a return');
    }

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    returnDoc.status = 'REJECTED';
    returnDoc.rejectionReason = rejectionReason.trim();
    returnDoc.refundStatus = 'Denied';
    returnDoc.statusHistory.push({
      status: 'REJECTED',
      changedBy: userId,
      note: `Rejected: ${rejectionReason.trim()}${note ? ' - ' + note : ''}`,
      timestamp: new Date(),
    });

    // Revert stock increase if return was previously approved
    if (returnDoc.isStockAdjusted) {
      try {
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Sale',
          quantity: returnDoc.quantity,
          reference: `Rejected Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Reverted stock: Return was rejected (${rejectionReason.trim()})`,
          adjustStock: true,
        });
        returnDoc.isStockAdjusted = false;
      } catch (stockErr) {
        console.warn('⚠️ Revert stock error on reject:', stockErr.message);
      }
    }

    await returnDoc.save();
    cache.flushAll?.();

    return sendResponse(res, 200, true, 'Return request rejected', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to reject return');
  }
};

/**
 * PUT /api/returns/:id/receive
 * Inventory Staff records receipt of returned product (RETURN_RECEIVED)
 */
export const receiveReturn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { note } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (!['APPROVED', 'Approved', 'PICKUP_ASSIGNED', 'OUT_FOR_PICKUP', 'PICKED_UP'].includes(returnDoc.status)) {
      return sendResponse(res, 400, false, 'Return must be approved or picked up before receiving the physical item');
    }

    returnDoc.status = 'RETURN_RECEIVED';
    returnDoc.receivedAt = new Date();
    returnDoc.statusHistory.push({
      status: 'RETURN_RECEIVED',
      changedBy: userId,
      note: note || 'Returned package physically received at warehouse',
      timestamp: new Date(),
    });

    // Update stock when returned product comes to inventory (if not damaged)
    await processArrivalAtInventory(returnDoc, userId, note);

    await returnDoc.save();
    cache.invalidatePrefix('returns:');
    cache.flush();

    return sendResponse(res, 200, true, 'Returned product marked as received', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to mark return received');
  }
};

/**
 * PUT /api/returns/:id/inspect
 * Inventory Staff inspects returned product: Resellable, Damaged, or Inspection Required
 * Updates inventory stock accordingly and prevents duplicate stock movements.
 */
export const inspectReturn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { inspectStatus, inspectionNotes } = req.body;

    if (!['Resellable', 'Damaged', 'Inspection Required', 'Restocked'].includes(inspectStatus)) {
      return sendResponse(
        res,
        400,
        false,
        "inspectStatus must be 'Resellable', 'Damaged', or 'Inspection Required'"
      );
    }

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    // Must be received or approved
    if (!['APPROVED', 'Approved', 'RETURN_RECEIVED', 'INSPECTED'].includes(returnDoc.status)) {
      return sendResponse(res, 400, false, 'Return must be approved or received before inspection');
    }

    const normalizedInspect = inspectStatus === 'Restocked' ? 'Resellable' : inspectStatus;

    returnDoc.inspectStatus = normalizedInspect;
    returnDoc.inspectionNotes = inspectionNotes || '';
    returnDoc.inspectedAt = new Date();
    returnDoc.inspectedBy = userId;
    returnDoc.status = 'INSPECTED';

    // Handle inventory update with duplicate prevention
    if (normalizedInspect === 'Resellable') {
      if (!returnDoc.isStockAdjusted) {
        // Restock resellable item if not already restocked on approval
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Return',
          quantity: returnDoc.quantity,
          reference: `Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Restocked resellable returned item ${returnDoc.returnNumber}${
            inspectionNotes ? ` (${inspectionNotes})` : ''
          }`,
        });
        returnDoc.isStockAdjusted = true;
      }
    } else if (normalizedInspect === 'Damaged') {
      if (returnDoc.isStockAdjusted) {
        // Item was added to stock upon approval, but physical inspection found damage:
        // Deduct from sellable stock and record damage
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Damage',
          quantity: returnDoc.quantity,
          reference: `Damaged Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Physical inspection found damage — deducted from sellable stock${
            inspectionNotes ? ` (${inspectionNotes})` : ''
          }`,
          adjustStock: true,
        });
        returnDoc.isStockAdjusted = false;
      } else {
        // Record damage in audit ledger without increasing sellable stock
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Damage',
          quantity: returnDoc.quantity,
          reference: `Damaged Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Returned item marked damaged — not added to sellable stock${
            inspectionNotes ? ` (${inspectionNotes})` : ''
          }`,
          adjustStock: false,
        });
        returnDoc.isStockAdjusted = false;
      }
    } else if (normalizedInspect === 'Inspection Required') {
      // Keep item unavailable for sale until subsequent final inspection
    }

    returnDoc.statusHistory.push({
      status: 'INSPECTED',
      changedBy: userId,
      note: `Inspected: ${normalizedInspect}${inspectionNotes ? ` - ${inspectionNotes}` : ''}`,
      timestamp: new Date(),
    });

    await returnDoc.save();
    cache.flushAll?.();

    return sendResponse(res, 200, true, `Inspection completed as ${normalizedInspect}`, {
      returnDoc,
    });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to inspect return');
  }
};

/**
 * POST /api/returns/:id/create-refund-order
 * Inventory Staff / Admin prepares a Razorpay Order for refund payment checkout
 */
export const createRefundPaymentOrder = async (req, res) => {
  try {
    const returnId = req.params.id;
    const returnDoc = await Return.findById(returnId)
      .populate('order')
      .populate('product')
      .populate('customer');

    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    // 1. Verify eligibility: Return must be physically inspected and verified OK (Resellable) or admin
    const isPassedInspection =
      (returnDoc.status === 'INSPECTED' && returnDoc.inspectStatus === 'Resellable') ||
      req.user?.role === 'admin';

    if (!isPassedInspection) {
      if (returnDoc.inspectStatus === 'Damaged') {
        return sendResponse(
          res,
          400,
          false,
          'Refund blocked: Returned product was inspected as Damaged. Damaged items are not eligible for standard refund.'
        );
      }
      return sendResponse(
        res,
        400,
        false,
        'Refund rejected: Product must be received and inspected as OK (Resellable) before issuing a refund'
      );
    }

    // 2. Prevent duplicate refund
    if (['Processed', 'Refunded'].includes(returnDoc.refundStatus)) {
      return sendResponse(
        res,
        400,
        false,
        `Refund has already been processed for this return (${
          returnDoc.refundDetails?.razorpayRefundId || 'Razorpay'
        })`
      );
    }

    const order = returnDoc.order;
    if (!order) {
      return sendResponse(res, 404, false, 'Associated order not found');
    }

    // 3. Calculate remaining refundable balance
    const otherRefunds = await Return.find({
      order: order._id,
      _id: { $ne: returnDoc._id },
      refundStatus: { $in: ['Processed', 'Refunded'] },
    });

    const previouslyRefundedAmount = otherRefunds.reduce(
      (sum, r) => sum + (r.refundDetails?.amount || r.refundAmount || 0),
      0
    );

    const remainingRefundableAmount = Math.max(0, order.totalAmount - previouslyRefundedAmount);
    if (remainingRefundableAmount <= 0) {
      return sendResponse(
        res,
        400,
        false,
        'The full order amount has already been refunded across previous return requests'
      );
    }

    const requestedRefundAmount = req.body.amount
      ? Number(req.body.amount)
      : returnDoc.refundAmount || (returnDoc.quantity * (returnDoc.unitPrice || 0));

    if (isNaN(requestedRefundAmount) || requestedRefundAmount <= 0) {
      return sendResponse(res, 400, false, 'Invalid refund amount requested');
    }

    if (requestedRefundAmount > remainingRefundableAmount) {
      return sendResponse(
        res,
        400,
        false,
        `Requested refund (₹${requestedRefundAmount}) exceeds remaining refundable balance (₹${remainingRefundableAmount})`
      );
    }

    const amountInPaise = Math.round(requestedRefundAmount * 100);
    const receipt = `rfnd_${returnDoc.returnNumber}_${Date.now().toString().slice(-6)}`;
    const keyId = process.env.RAZORPAY_KEY_ID || '';

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        returnId: returnDoc._id.toString(),
        returnNumber: returnDoc.returnNumber,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        productName: returnDoc.productName || returnDoc.product?.name,
        type: 'RETURN_REFUND',
      },
    });

    return sendResponse(res, 200, true, 'Refund payment order created successfully', {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId,
      customer: {
        fullName: returnDoc.customer?.fullName || order.shippingAddress?.fullName || 'Customer',
        email: returnDoc.customer?.email || 'customer@branddna.ai',
        phone: returnDoc.customer?.phone || order.shippingAddress?.phone || '9999999999',
      },
      returnNumber: returnDoc.returnNumber,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error('Error creating refund payment order:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to create refund payment order');
  }
};

/**
 * POST /api/returns/:id/refund
 * Inventory Staff / Admin initiates real Razorpay refund or verifies live checkout payment
 */
export const processRazorpayRefund = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const returnId = req.params.id;

    const returnDoc = await Return.findById(returnId).populate('order').populate('product');
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    // 1. Verify eligibility: Return must be physically inspected and verified OK (Resellable)
    const isPassedInspection =
      (returnDoc.status === 'INSPECTED' && returnDoc.inspectStatus === 'Resellable') ||
      req.user?.role === 'admin';

    if (!isPassedInspection) {
      if (returnDoc.inspectStatus === 'Damaged') {
        return sendResponse(
          res,
          400,
          false,
          'Refund blocked: Returned product was inspected as Damaged. Damaged items are not eligible for standard refund.'
        );
      }
      return sendResponse(
        res,
        400,
        false,
        'Refund rejected: Product must be received and inspected as OK (Resellable) by inventory staff before issuing a refund'
      );
    }

    // 2. Prevent duplicate refund
    if (['Processed', 'Refunded'].includes(returnDoc.refundStatus)) {
      return sendResponse(
        res,
        400,
        false,
        `Refund has already been processed for this return (${
          returnDoc.refundDetails?.razorpayRefundId || 'Razorpay'
        })`
      );
    }

    // 3. Verify Order & Payment Details
    const order = returnDoc.order;
    if (!order) {
      return sendResponse(res, 404, false, 'Associated order not found');
    }

    if (order.paymentStatus !== 'Paid' && order.paymentStatus !== 'Refunded') {
      return sendResponse(res, 400, false, 'Cannot refund an order that was not paid');
    }

    if (!order.razorpayPaymentId) {
      if (process.env.NODE_ENV !== 'production' || !process.env.RAZORPAY_KEY_ID) {
        order.razorpayPaymentId = `pay_sim_${Date.now()}`;
        if (order.paymentStatus !== 'Paid') order.paymentStatus = 'Paid';
        await order.save();
      } else {
        return sendResponse(
          res,
          400,
          false,
          'Original Razorpay payment ID is missing from this order'
        );
      }
    }

    // 4. Calculate previously refunded amounts and remaining refundable amount
    const otherRefunds = await Return.find({
      order: order._id,
      _id: { $ne: returnDoc._id },
      refundStatus: { $in: ['Processed', 'Refunded'] },
    });

    const previouslyRefundedAmount = otherRefunds.reduce(
      (sum, r) => sum + (r.refundDetails?.amount || r.refundAmount || 0),
      0
    );

    const remainingRefundableAmount = Math.max(0, order.totalAmount - previouslyRefundedAmount);

    if (remainingRefundableAmount <= 0) {
      return sendResponse(
        res,
        400,
        false,
        'The full order amount has already been refunded across previous return requests'
      );
    }

    // Determine refund amount: partial or full for this item
    const requestedRefundAmount = req.body.amount
      ? Number(req.body.amount)
      : returnDoc.refundAmount || (returnDoc.quantity * (returnDoc.unitPrice || 0));

    if (isNaN(requestedRefundAmount) || requestedRefundAmount <= 0) {
      return sendResponse(res, 400, false, 'Invalid refund amount requested');
    }

    if (requestedRefundAmount > remainingRefundableAmount) {
      return sendResponse(
        res,
        400,
        false,
        `Requested refund (₹${requestedRefundAmount}) exceeds remaining refundable balance (₹${remainingRefundableAmount})`
      );
    }

    // 5. Execute Refund via Live Checkout Gateway or Razorpay API
    let refundResponse;
    const isLiveCheckoutPayment = Boolean(req.body.razorpay_payment_id);

    if (isLiveCheckoutPayment) {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      // Verify signature if provided
      if (razorpay_signature && razorpay_order_id) {
        const isValid = verifyRazorpaySignature({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
        if (!isValid) {
          return sendResponse(res, 400, false, 'Razorpay payment signature verification failed');
        }
      }

      refundResponse = {
        id: razorpay_payment_id,
        amount: requestedRefundAmount * 100,
        currency: 'INR',
        status: 'processed',
        payment_id: razorpay_payment_id,
        notes: {
          returnNumber: returnDoc.returnNumber,
          orderNumber: order.orderNumber,
          channel: 'Razorpay Checkout Gateway',
        },
      };
    } else {
      refundResponse = await createRazorpayRefund({
        paymentId: order.razorpayPaymentId,
        amount: requestedRefundAmount,
        receipt: `rfnd_${returnDoc.returnNumber}`,
        notes: {
          returnNumber: returnDoc.returnNumber,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          productName: returnDoc.productName || returnDoc.product?.name,
        },
      });
    }

    // 6. Record Razorpay refund details and update status
    returnDoc.refundStatus = 'Processed';
    returnDoc.refundDetails = {
      razorpayRefundId: refundResponse.id,
      amount: requestedRefundAmount,
      status: refundResponse.status || 'processed',
      refundedAt: new Date(),
      notes: refundResponse.notes || {},
    };

    returnDoc.statusHistory.push({
      status: returnDoc.status,
      changedBy: userId,
      note: `Razorpay refund payment issued: ₹${requestedRefundAmount} (Transaction ID: ${refundResponse.id})`,
      timestamp: new Date(),
    });

    await returnDoc.save();

    // Check if entire order amount has been refunded now
    const totalRefundedNow = previouslyRefundedAmount + requestedRefundAmount;
    if (totalRefundedNow >= order.totalAmount) {
      order.paymentStatus = 'Refunded';
      await order.save();
    }

    return sendResponse(res, 200, true, 'Refund initiated successfully via Razorpay', {
      returnDoc,
      refundResponse,
      previouslyRefundedAmount,
      remainingRefundableAmount: Math.max(0, remainingRefundableAmount - requestedRefundAmount),
    });
  } catch (err) {
    console.error('Refund processing error:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to process Razorpay refund');
  }
};

/**
 * PUT /api/returns/:id/process
 * Backward compatibility endpoint for staff processing (approves / inspects)
 */
export const processReturn = async (req, res) => {
  try {
    const { status, inspectStatus, rejectionReason } = req.body;
    const userId = req.user?._id || req.user?.id;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (status) {
      if (status === 'REJECTED' || status === 'Rejected') {
        returnDoc.status = 'REJECTED';
        returnDoc.rejectionReason = rejectionReason || 'Rejected by staff';
        returnDoc.refundStatus = 'Denied';
      } else {
        returnDoc.status = status;
      }
    }

    if (inspectStatus) {
      const normalizedInspect = inspectStatus === 'Restocked' ? 'Resellable' : inspectStatus;
      returnDoc.inspectStatus = normalizedInspect;
      returnDoc.inspectedAt = new Date();
      returnDoc.inspectedBy = userId;

      if (normalizedInspect === 'Resellable' && !returnDoc.isStockAdjusted) {
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Return',
          quantity: returnDoc.quantity,
          reference: `Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Restocked customer return ${returnDoc.returnNumber}`,
          adjustStock: true,
        });
        returnDoc.isStockAdjusted = true;
      } else if (normalizedInspect === 'Damaged') {
        if (returnDoc.isStockAdjusted) {
          await recordStockMovement({
            productId: returnDoc.product,
            transactionType: 'Damage',
            quantity: returnDoc.quantity,
            reference: `Damaged Return ${returnDoc.returnNumber}`,
            referenceId: returnDoc._id,
            userId,
            notes: `Returned item marked damaged — deducted from sellable stock`,
            adjustStock: true,
          });
        } else {
          await recordStockMovement({
            productId: returnDoc.product,
            transactionType: 'Damage',
            quantity: returnDoc.quantity,
            reference: `Damaged Return ${returnDoc.returnNumber}`,
            referenceId: returnDoc._id,
            userId,
            notes: `Returned item marked damaged — not added to sellable stock`,
            adjustStock: false,
          });
        }
        returnDoc.isStockAdjusted = false;
      }
    }

    returnDoc.statusHistory.push({
      status: returnDoc.status,
      changedBy: userId,
      note: `Processed as ${returnDoc.status} (${returnDoc.inspectStatus})`,
      timestamp: new Date(),
    });

    await returnDoc.save();

    return sendResponse(
      res,
      200,
      true,
      `Return processed cleanly as ${returnDoc.status} (${returnDoc.inspectStatus})`,
      { returnDoc }
    );
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to process return');
  }
};

/**
 * POST /api/returns/upload-evidence
 * Upload return evidence photo from device
 */
export const uploadEvidenceFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'No image file uploaded');
    }
    const imageUrl = `/uploads/returns/${req.file.filename}`;
    return sendResponse(res, 200, true, 'Evidence image uploaded successfully', { imageUrl });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to upload evidence image');
  }
};
