import { Return } from '../models/Return.js';
import { Order } from '../models/Order.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { sendResponse } from '../utils/apiResponse.js';

// GET /api/returns
export const getReturns = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    const filter = {};
    if (role === 'customer') {
      filter.customer = userId;
    }

    const returns = await Return.find(filter)
      .populate('order', 'orderNumber status')
      .populate('customer', 'fullName email')
      .populate('product', 'name sku price stock')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Returns retrieved', { returns });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch returns');
  }
};

// POST /api/returns (Customer creates return request)
export const createReturn = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    const { orderId, productId, quantity, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;

    const returnDoc = await Return.create({
      returnNumber,
      order: orderId,
      customer: customerId,
      product: productId,
      quantity: Number(quantity || 1),
      reason,
      status: 'Pending',
      inspectStatus: 'PendingInspection',
      refundStatus: 'Pending',
    });

    return sendResponse(res, 201, true, 'Return request submitted successfully', { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create return request');
  }
};

// PUT /api/returns/:id/process (Staff approves/rejects and inspects: Restocked vs Damaged)
export const processReturn = async (req, res) => {
  try {
    const { status, inspectStatus } = req.body;
    const userId = req.user?._id || req.user?.id;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return sendResponse(res, 404, false, 'Return request not found');
    }

    if (status) returnDoc.status = status;
    if (inspectStatus) returnDoc.inspectStatus = inspectStatus;

    // Handle restocking vs damage
    if (status === 'Approved' && inspectStatus) {
      if (inspectStatus === 'Restocked') {
        // Automatically increase sellable stock
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Return',
          quantity: returnDoc.quantity,
          reference: `Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Approved restocked customer return ${returnDoc.returnNumber}`,
        });
        returnDoc.refundStatus = 'Processed';
      } else if (inspectStatus === 'Damaged') {
        // Do NOT increase sellable stock; log damage record
        await recordStockMovement({
          productId: returnDoc.product,
          transactionType: 'Damage',
          quantity: returnDoc.quantity,
          reference: `Damaged Return ${returnDoc.returnNumber}`,
          referenceId: returnDoc._id,
          userId,
          notes: `Returned item marked damaged — not added to sellable stock`,
        });
        returnDoc.refundStatus = 'Processed';
      }
    }

    await returnDoc.save();

    return sendResponse(res, 200, true, `Return processed cleanly as ${returnDoc.status} (${returnDoc.inspectStatus})`, { returnDoc });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to process return');
  }
};
