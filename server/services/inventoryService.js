import { Product } from '../models/Product.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';

/**
 * Perform Stock Movement Transaction and recalculate stock
 */
export const recordStockMovement = async ({
  productId,
  transactionType, // 'Purchase' | 'Sale' | 'Return' | 'Damage' | 'Adjustment'
  quantity,
  reference = '',
  referenceId = null,
  userId = null,
  notes = '',
  adjustStock = true, // When false (e.g. returned damaged items), record damage audit ledger without changing available stock
}) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found for inventory movement');
  }

  const previousStock = product.stock;
  let newStock = previousStock;

  const qty = Number(quantity);

  if (adjustStock) {
    switch (transactionType) {
      case 'Purchase':
      case 'Return': // Restocked return increases available sellable stock
        newStock = previousStock + qty;
        break;
      case 'Sale':
      case 'Damage': // Warehouse damaged stock deduction
        newStock = Math.max(0, previousStock - qty);
        break;
      case 'Adjustment':
        newStock = Math.max(0, previousStock + qty); // positive or negative adjustment
        break;
      default:
        throw new Error(`Invalid inventory transaction type: ${transactionType}`);
    }

    product.stock = newStock;
    await product.save();
  }

  const transaction = await InventoryTransaction.create({
    product: productId,
    transactionType,
    quantity: qty,
    previousStock,
    newStock,
    reference,
    referenceId,
    user: userId,
    notes,
  });

  return { product, transaction };
};

/**
 * Get stock movement ledger for a product or overall
 */
export const getInventoryLedger = async (filters = {}, limit = 200) => {
  return await InventoryTransaction.find(filters)
    .populate({
      path: 'product',
      select: 'name sku price cost stock category categoryName images',
      populate: { path: 'category', select: 'name' }
    })
    .populate('user', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Calculate total inventory valuation and summary statistics
 */
export const getInventoryValuationSummary = async () => {
  const products = await Product.find({ status: { $ne: 'Discontinued' } }).select('stock cost price reorderLevel').lean();

  let totalItemsCount = 0;
  let totalStockUnits = 0;
  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  let lowStockCount = 0;

  products.forEach((p) => {
    totalItemsCount += 1;
    totalStockUnits += p.stock;
    totalCostValuation += p.stock * p.cost;
    totalRetailValuation += p.stock * p.price;
    if (p.stock <= (p.reorderLevel || 10)) {
      lowStockCount += 1;
    }
  });

  return {
    totalItemsCount,
    totalStockUnits,
    totalCostValuation,
    totalRetailValuation,
    lowStockCount,
    potentialProfit: totalRetailValuation - totalCostValuation,
  };
};
