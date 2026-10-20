import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { Supplier } from '../models/Supplier.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { sendResponse } from '../utils/apiResponse.js';

// GET /api/purchases (List POs)
export const getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('supplier')
      .populate('items.product')
      .sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Purchase orders retrieved', { purchaseOrders: pos });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch purchase orders');
  }
};

// POST /api/purchases (Create PO)
export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(res, 400, false, 'Supplier and items are required');
    }

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    let totalAmount = 0;
    const formattedItems = items.map((item) => {
      const totalCost = Number(item.quantity) * Number(item.unitCost);
      totalAmount += totalCost;
      return {
        product: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        totalCost,
      };
    });

    const po = await PurchaseOrder.create({
      poNumber,
      supplier: supplierId,
      items: formattedItems,
      totalAmount,
      status: 'Ordered',
      createdBy: userId,
    });

    return sendResponse(res, 201, true, 'Purchase order created successfully', { purchaseOrder: po });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create purchase order');
  }
};

// PUT /api/purchases/:id/receive (Receive PO stock -> Auto updates inventory)
export const receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return sendResponse(res, 404, false, 'Purchase order not found');
    }
    if (po.status === 'Received') {
      return sendResponse(res, 400, false, 'Purchase order is already received');
    }

    const userId = req.user?._id || req.user?.id;

    // Receive each item and automatically update inventory stock ledger
    for (const item of po.items) {
      await recordStockMovement({
        productId: item.product,
        transactionType: 'Purchase',
        quantity: item.quantity,
        reference: `Received PO ${po.poNumber}`,
        referenceId: po._id,
        userId,
        notes: `Stock received from Supplier purchase order ${po.poNumber}`,
      });
    }

    po.status = 'Received';
    po.receivedDate = new Date();
    await po.save();

    return sendResponse(res, 200, true, 'Purchase order received and stock automatically updated', { purchaseOrder: po });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to receive purchase order');
  }
};

// GET /api/purchases/suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ status: 'Active' });
    return sendResponse(res, 200, true, 'Suppliers retrieved', { suppliers });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch suppliers');
  }
};

// POST /api/purchases/suppliers
export const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    const supplier = await Supplier.create({ name, contactPerson, email, phone, address });
    return sendResponse(res, 201, true, 'Supplier created', { supplier });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create supplier');
  }
};
