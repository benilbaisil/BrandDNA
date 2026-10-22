import { Return } from '../models/Return.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { createRazorpayRefund } from '../services/razorpayService.js';
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
    const cacheKey = `returns:${role || 'all'}:${role === 'customer' ? userId : 'all'}:${req.query.orderId || ''}:${req.query.status || ''}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Returns retrieved successfully (instant cache)', cached);
    }

    const filter = {};
    if (role === 'customer') {
      filter.customer = userId;
    } else if (req.query.orderId) {
      filter.order = req.query.orderId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const returns = await Return.find(filter)
      .populate('order', 'orderNumber status paymentStatus totalAmount razorpayPaymentId deliveredAt createdAt')
      .populate('customer', 'fullName email phone')
      .populate('product', 'name sku price stock images category')
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
      .populate('customer', 'fullName email phone')
      .populate('product')
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
      reason,
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

    returnDoc.status = 'APPROVED';
    returnDoc.statusHistory.push({
      status: 'APPROVED',
      changedBy: userId,
      note: note || 'Return request approved by staff',
      timestamp: new Date(),
    });

    await returnDoc.save();

    return sendResponse(res, 200, true, 'Return request approved successfully', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to approve return');
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

    await returnDoc.save();

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

    if (!['APPROVED', 'Approved'].includes(returnDoc.status)) {
      return sendResponse(res, 400, false, 'Return must be approved before receiving the physical item');
    }

    returnDoc.status = 'RETURN_RECEIVED';
    returnDoc.statusHistory.push({
      status: 'RETURN_RECEIVED',
      changedBy: userId,
      note: note || 'Returned package physically received at warehouse',
      timestamp: new Date(),
    });

    await returnDoc.save();

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
    if (normalizedInspect === 'Resellable' && !returnDoc.isStockAdjusted) {
      // Restock resellable item into available stock
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
    } else if (normalizedInspect === 'Damaged' && !returnDoc.isStockAdjusted) {
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
        adjustStock: false, // Prevents decreasing already-sold stock
      });
      returnDoc.isStockAdjusted = true;
    } else if (normalizedInspect === 'Inspection Required') {
      // Keep item unavailable for sale until subsequent final inspection
      returnDoc.isStockAdjusted = false;
    }

    returnDoc.statusHistory.push({
      status: 'INSPECTED',
      changedBy: userId,
      note: `Inspected: ${normalizedInspect}${inspectionNotes ? ` - ${inspectionNotes}` : ''}`,
      timestamp: new Date(),
    });

    await returnDoc.save();

    return sendResponse(res, 200, true, `Inspection completed as ${normalizedInspect}`, {
      returnDoc,
    });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to inspect return');
  }
};

/**
 * POST /api/returns/:id/refund
 * Inventory Staff / Admin initiates real Razorpay refund
 */
export const processRazorpayRefund = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const returnId = req.params.id;

    const returnDoc = await Return.findById(returnId).populate('order').populate('product');
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    // 1. Verify eligibility: Return must be approved or inspected
    const isApprovedOrInspected = [
      'APPROVED',
      'Approved',
      'RETURN_RECEIVED',
      'INSPECTED',
    ].includes(returnDoc.status);

    if (!isApprovedOrInspected) {
      return sendResponse(
        res,
        400,
        false,
        'Refund rejected: Return request must be approved or inspected before issuing a refund'
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
      return sendResponse(
        res,
        400,
        false,
        'Original Razorpay payment ID is missing from this order'
      );
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

    // 5. Call Razorpay Refund API
    const refundResponse = await createRazorpayRefund({
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
      note: `Razorpay refund issued: ₹${requestedRefundAmount} (Refund ID: ${refundResponse.id})`,
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
        });
        returnDoc.isStockAdjusted = true;
      } else if (normalizedInspect === 'Damaged' && !returnDoc.isStockAdjusted) {
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
        returnDoc.isStockAdjusted = true;
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
