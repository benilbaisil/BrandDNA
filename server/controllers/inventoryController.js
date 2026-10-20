import { Product } from '../models/Product.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { Order } from '../models/Order.js';
import { Return } from '../models/Return.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import {
  getInventoryLedger,
  getInventoryValuationSummary,
  recordStockMovement,
} from '../services/inventoryService.js';
import { generateAIInventoryInsights } from '../services/inventoryAiService.js';
import { sendResponse } from '../utils/apiResponse.js';

// GET /api/inventory/summary
export const getSummary = async (req, res) => {
  try {
    const summary = await getInventoryValuationSummary();
    return sendResponse(res, 200, true, 'Inventory summary fetched', summary);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch inventory summary');
  }
};

// GET /api/inventory/dashboard-stats (Real MongoDB telemetry for Inventory Staff)
export const getDashboardStats = async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: 'Discontinued' } }).populate('category');

    let totalProducts = products.length;
    let totalAvailableStock = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    products.forEach((p) => {
      totalAvailableStock += (p.stock || 0);
      if (p.stock === 0) {
        outOfStockProducts += 1;
      } else if (p.stock <= (p.reorderLevel || 10)) {
        lowStockProducts += 1;
      }
    });

    // Recent Stock Movements (last 10)
    const recentMovements = await InventoryTransaction.find()
      .populate({
        path: 'product',
        select: 'name sku images price category categoryName stock',
        populate: { path: 'category', select: 'name' }
      })
      .populate('user', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent Orders requiring processing
    const recentOrders = await Order.find()
      .populate('customer', 'fullName email phone')
      .populate({
        path: 'items.product',
        select: 'name sku images category categoryName price',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(8);

    // Recently Received Stock (Purchase transactions)
    const recentPurchases = await InventoryTransaction.find({ transactionType: 'Purchase' })
      .populate({
        path: 'product',
        select: 'name sku images category categoryName price',
        populate: { path: 'category', select: 'name' }
      })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(8);

    // Recently Returned Products
    const recentReturns = await Return.find()
      .populate('order', 'orderNumber')
      .populate('customer', 'fullName email')
      .populate({
        path: 'product',
        select: 'name sku images category categoryName price',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(8);

    // Recently Damaged Products
    const recentDamages = await InventoryTransaction.find({ transactionType: 'Damage' })
      .populate({
        path: 'product',
        select: 'name sku images category categoryName price',
        populate: { path: 'category', select: 'name' }
      })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(8);

    return sendResponse(res, 200, true, 'Inventory dashboard telemetry fetched successfully', {
      totalProducts,
      totalAvailableStock,
      lowStockProducts,
      outOfStockProducts,
      recentMovements,
      recentOrders,
      recentPurchases,
      recentReturns,
      recentDamages,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch inventory dashboard telemetry');
  }
};

// GET /api/inventory/ledger
export const getLedger = async (req, res) => {
  try {
    const { productId, transactionType } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (transactionType && transactionType !== 'ALL') filter.transactionType = transactionType;

    const ledger = await getInventoryLedger(filter, 200);
    return sendResponse(res, 200, true, 'Inventory movement ledger retrieved', { ledger });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch ledger');
  }
};

// POST /api/inventory/stock-in
export const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reference, notes } = req.body;
    const userId = req.user?._id || req.user?.id;

    const qty = Number(quantity);
    if (!productId || isNaN(qty) || qty <= 0) {
      return sendResponse(res, 400, false, 'Valid product ID and positive quantity are required');
    }

    const result = await recordStockMovement({
      productId,
      transactionType: 'Purchase',
      quantity: qty,
      reference: reference || 'Stock In Received',
      userId,
      notes: notes || 'Manual Stock In',
    });

    return sendResponse(res, 200, true, 'Stock successfully added into inventory', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Stock In failed');
  }
};

// POST /api/inventory/stock-out
export const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reference, notes } = req.body;
    const userId = req.user?._id || req.user?.id;

    const qty = Number(quantity);
    if (!productId || isNaN(qty) || qty <= 0) {
      return sendResponse(res, 400, false, 'Valid product ID and positive quantity are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    if (product.stock < qty) {
      return sendResponse(res, 400, false, `Cannot perform Stock Out: Requested quantity (${qty}) exceeds available stock (${product.stock})`);
    }

    const result = await recordStockMovement({
      productId,
      transactionType: 'Sale',
      quantity: qty,
      reference: reference || 'Stock Out Issued',
      userId,
      notes: notes || 'Manual Stock Out',
    });

    return sendResponse(res, 200, true, 'Stock successfully deducted from inventory', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Stock Out failed');
  }
};

// POST /api/inventory/damage
export const recordDamage = async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;
    const userId = req.user?._id || req.user?.id;

    const qty = Number(quantity);
    if (!productId || isNaN(qty) || qty <= 0) {
      return sendResponse(res, 400, false, 'Valid product ID and positive damaged quantity are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    if (product.stock < qty) {
      return sendResponse(res, 400, false, `Damaged quantity (${qty}) cannot exceed current stock (${product.stock})`);
    }

    const result = await recordStockMovement({
      productId,
      transactionType: 'Damage',
      quantity: qty,
      reference: reason || 'Damaged Stock Recorded',
      userId,
      notes: notes || 'Damaged item removed from sellable stock',
    });

    return sendResponse(res, 200, true, 'Damaged stock recorded cleanly and deducted from inventory', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to record damaged stock');
  }
};

// POST /api/inventory/adjust
export const adjustStock = async (req, res) => {
  try {
    const { productId, transactionType, quantity, reference, notes } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!productId || !transactionType || quantity === undefined) {
      return sendResponse(res, 400, false, 'ProductId, transactionType, and quantity are required');
    }

    const result = await recordStockMovement({
      productId,
      transactionType,
      quantity: Number(quantity),
      reference: reference || 'Manual Adjustment',
      userId,
      notes: notes || '',
    });

    return sendResponse(res, 200, true, 'Stock movement recorded successfully', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Stock adjustment failed');
  }
};

// GET /api/inventory/reports
export const getReports = async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: 'Discontinued' } }).populate('category').sort({ name: 1 });
    const movements = await InventoryTransaction.find().populate('product').populate('user').sort({ createdAt: -1 }).limit(300);
    const returns = await Return.find().populate('product').populate('customer').populate('order').sort({ createdAt: -1 });

    const lowStockList = products.filter(p => p.stock > 0 && p.stock <= (p.reorderLevel || 10));
    const outOfStockList = products.filter(p => p.stock === 0);
    const purchasesList = movements.filter(m => m.transactionType === 'Purchase');
    const damagesList = movements.filter(m => m.transactionType === 'Damage');

    return sendResponse(res, 200, true, 'Inventory reports generated successfully', {
      products,
      lowStockList,
      outOfStockList,
      movements,
      purchasesList,
      damagesList,
      returns,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to generate inventory reports');
  }
};

// GET /api/inventory/intelligence
export const getInventoryIntelligence = async (req, res) => {
  try {
    const intelligence = await generateAIInventoryInsights();
    return sendResponse(res, 200, true, 'AI Inventory Intelligence fetched', intelligence);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch AI Inventory Intelligence');
  }
};

