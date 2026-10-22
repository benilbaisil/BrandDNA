import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Return } from '../models/Return.js';
import { Campaign } from '../models/Campaign.js';
import { MarketingContent } from '../models/MarketingContent.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { getRecentActivities } from '../services/activityService.js';
import { sendResponse } from '../utils/apiResponse.js';
import { cache } from '../utils/cache.js';

// Fast In-Memory Inventory Valuation Calculator
const computeInventoryValuation = (products) => {
  let totalItemsCount = 0;
  let totalStockUnits = 0;
  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  let lowStockCount = 0;

  products.forEach((p) => {
    totalItemsCount += 1;
    const stock = Number(p.stock) || 0;
    const cost = Number(p.cost) || 0;
    const price = Number(p.price) || 0;
    totalStockUnits += stock;
    totalCostValuation += stock * cost;
    totalRetailValuation += stock * price;
    if (stock <= (p.reorderLevel || 10)) {
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

// Fast In-Memory Inventory Analytics Calculator
const computeInventoryAnalytics = (products, saleTransactions = []) => {
  const salesMap = {};
  saleTransactions.forEach((tx) => {
    const pId = tx.product ? tx.product.toString() : '';
    if (pId) {
      salesMap[pId] = (salesMap[pId] || 0) + (Number(tx.quantity) || 0);
    }
  });

  const productAnalytics = products.map((p) => {
    const pId = p._id ? p._id.toString() : '';
    const unitsSold30d = salesMap[pId] || 0;
    const avgDailySales = unitsSold30d > 0 ? parseFloat((unitsSold30d / 30).toFixed(2)) : 0.1;
    const stock = Number(p.stock) || 0;
    const daysOfSupplyRemaining = avgDailySales > 0 ? Math.round(stock / avgDailySales) : 999;
    const leadTime = p.leadTimeDays || 5;
    const isLowStock = stock <= (p.reorderLevel || 10) || daysOfSupplyRemaining <= (leadTime + 2);
    const isOverstock = stock > (p.targetStockLevel || 50) && daysOfSupplyRemaining > 60;
    const isSlowMoving = unitsSold30d <= 2 && stock > 15;
    const isDeadStock = unitsSold30d === 0 && stock > 20;

    let reorderQuantity = 0;
    if (isLowStock) {
      const targetLevel = p.targetStockLevel || 50;
      reorderQuantity = Math.max(0, targetLevel - stock);
    }

    return {
      productId: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || p.categoryName || 'General',
      currentStock: stock,
      price: p.price,
      cost: p.cost,
      reorderLevel: p.reorderLevel || 10,
      leadTimeDays: leadTime,
      unitsSold30d,
      avgDailySales,
      daysOfSupplyRemaining,
      isLowStock,
      isOverstock,
      isSlowMoving,
      isDeadStock,
      reorderQuantity,
    };
  });

  return {
    productAnalytics,
    lowStockItems: productAnalytics.filter((p) => p.isLowStock),
    overstockItems: productAnalytics.filter((p) => p.isOverstock),
    slowMovingItems: productAnalytics.filter((p) => p.isSlowMoving || p.isDeadStock),
  };
};

// GET /api/dashboard/admin
export const getAdminDashboard = async (req, res) => {
  try {
    const cacheKey = 'dashboard:admin';
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Admin dashboard fetched (instant cache)', cached);
    }

    // Parallelized single-round database query execution
    const [products, totalCustomers, orders, returns, campaigns, recentActivities, pendingMarketingContents] =
      await Promise.all([
        Product.find({ status: { $ne: 'Discontinued' } }).populate('category').lean(),
        User.countDocuments({ role: 'customer' }),
        Order.find()
          .populate({ path: 'items.product', select: 'name sku price category categoryName images' })
          .sort({ createdAt: -1 })
          .lean(),
        Return.find().lean(),
        Campaign.find().lean(),
        getRecentActivities(10).catch(() => []),
        MarketingContent.countDocuments({ status: 'Submitted' }).catch(() => 0),
      ]);

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Packed').length;
    const pendingReturns = returns.filter((r) => r.status === 'Pending').length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;

    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const invSummary = computeInventoryValuation(products);
    const invAnalytics = computeInventoryAnalytics(products, []);

    // Sales Overview
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const salesToday = orders
      .filter((o) => new Date(o.createdAt) >= startOfToday)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const salesThisWeek = orders
      .filter((o) => new Date(o.createdAt) >= startOfWeek)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const salesThisMonth = orders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Sales Trend (Past 7 Days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayTotal = orders
        .filter((o) => {
          const oDate = new Date(o.createdAt);
          return oDate >= dStart && oDate <= dEnd;
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      salesTrend.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        sales: dayTotal,
      });
    }

    const orderStatusCounts = {
      Placed: 0,
      Confirmed: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0,
    };

    const paymentStatusCounts = {
      Paid: { count: 0, revenue: 0 },
      Pending: { count: 0, revenue: 0 },
      Failed: { count: 0, revenue: 0 },
      Refunded: { count: 0, revenue: 0 },
    };

    let totalProductsSoldQuantity = 0;
    const productSalesMap = {};
    const categorySalesMap = {};

    orders.forEach((o) => {
      if (orderStatusCounts[o.status] !== undefined) {
        orderStatusCounts[o.status] += 1;
      }
      const pStatus = o.paymentStatus || 'Pending';
      if (!paymentStatusCounts[pStatus]) {
        paymentStatusCounts[pStatus] = { count: 0, revenue: 0 };
      }
      paymentStatusCounts[pStatus].count += 1;
      paymentStatusCounts[pStatus].revenue += o.totalAmount || 0;

      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const qty = Number(item.quantity) || 0;
          totalProductsSoldQuantity += qty;
          const prodName = item.product?.name || item.name || 'Product';
          const catName = item.product?.category?.name || item.product?.categoryName || 'General';

          if (!productSalesMap[prodName]) {
            productSalesMap[prodName] = { name: prodName, unitsSold: 0, revenue: 0 };
          }
          productSalesMap[prodName].unitsSold += qty;
          productSalesMap[prodName].revenue += (item.price || 0) * qty;

          if (!categorySalesMap[catName]) {
            categorySalesMap[catName] = { name: catName, unitsSold: 0, revenue: 0 };
          }
          categorySalesMap[catName].unitsSold += qty;
          categorySalesMap[catName].revenue += (item.price || 0) * qty;
        });
      }
    });

    const orderStatusSummary = Object.keys(orderStatusCounts).map((status) => ({
      name: status,
      count: orderStatusCounts[status],
    }));

    const productSalesList = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);
    const categorySalesList = Object.values(categorySalesMap).sort((a, b) => b.revenue - a.revenue);
    const topProducts = productSalesList.slice(0, 5);

    const payload = {
      summary: {
        totalSales,
        totalOrders,
        totalProducts: products.length,
        totalCustomers,
        pendingOrders,
        pendingReturns,
        activeCampaigns,
        outOfStockProducts,
        totalProductsSoldQuantity,
        salesToday,
        salesThisWeek,
        salesThisMonth,
      },
      salesTrend,
      valuation: {
        costValuation: invSummary.totalCostValuation,
        retailValuation: invSummary.totalRetailValuation,
        potentialProfit: invSummary.potentialProfit,
      },
      orderStatusSummary,
      paymentStatusSummary: paymentStatusCounts,
      productSalesList,
      categorySalesList,
      inventorySummary: {
        totalStockUnits: invSummary.totalStockUnits,
        lowStockItems: invAnalytics.lowStockItems.length,
        outOfStockItems: outOfStockProducts,
        overstockItems: invAnalytics.overstockItems.length,
      },
      topProducts,
      pendingMarketingContents,
      recentActivities,
      recentOrders: orders.slice(0, 5),
    };

    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Admin dashboard fetched', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch admin dashboard');
  }
};

// GET /api/dashboard/inventory
export const getInventoryDashboard = async (req, res) => {
  try {
    const cacheKey = 'dashboard:inventory';
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Inventory dashboard fetched (instant cache)', cached);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallelized single-round database query execution
    const [products, saleTransactions, recentMovements, pendingReturns] = await Promise.all([
      Product.find({ status: { $ne: 'Discontinued' } }).populate('category').lean(),
      InventoryTransaction.find({
        transactionType: 'Sale',
        createdAt: { $gte: thirtyDaysAgo },
      }).lean(),
      InventoryTransaction.find()
        .populate({
          path: 'product',
          select: 'name sku price cost stock category categoryName images',
        })
        .populate('user', 'fullName email role')
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      Return.find({ status: 'Approved', inspectStatus: 'PendingInspection' })
        .populate('order', 'orderNumber')
        .populate('product', 'name sku price stock')
        .populate('customer', 'fullName email')
        .lean(),
    ]);

    const outOfStockProducts = products.filter((p) => p.stock === 0);
    const invSummary = computeInventoryValuation(products);
    const invAnalytics = computeInventoryAnalytics(products, saleTransactions);

    // Stock distribution by category
    const categoryMap = {};
    products.forEach((p) => {
      const catName = p.category?.name || p.categoryName || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, productCount: 0, stockUnits: 0, valuation: 0 };
      }
      categoryMap[catName].productCount += 1;
      const stock = Number(p.stock) || 0;
      const cost = Number(p.cost) || 0;
      categoryMap[catName].stockUnits += stock;
      categoryMap[catName].valuation += stock * cost;
    });

    const stockByCategory = Object.values(categoryMap);

    // Alerts
    const alerts = [];
    outOfStockProducts.forEach((p) => {
      alerts.push({ type: 'OutOfStock', title: `Out of Stock: ${p.name}`, message: `SKU ${p.sku} has 0 stock remaining!`, priority: 'High' });
    });
    invAnalytics.lowStockItems.forEach((p) => {
      if (p.currentStock > 0) {
        alerts.push({ type: 'LowStock', title: `Low Stock Alert: ${p.name}`, message: `Stock (${p.currentStock}) is at or below reorder level (${p.reorderLevel}).`, priority: 'Medium' });
      }
    });
    invAnalytics.overstockItems.forEach((p) => {
      alerts.push({ type: 'Overstock', title: `Overstock Warning: ${p.name}`, message: `Current stock (${p.currentStock}) exceeds target level.`, priority: 'Low' });
    });

    const payload = {
      summary: {
        totalProducts: invSummary.totalItemsCount,
        totalStockUnits: invSummary.totalStockUnits,
        lowStockProducts: invSummary.lowStockCount,
        outOfStockProducts: outOfStockProducts.length,
        overstockProducts: invAnalytics.overstockItems.length,
        inventoryValue: invSummary.totalCostValuation,
        retailValuation: invSummary.totalRetailValuation,
      },
      lowStockList: invAnalytics.lowStockItems,
      stockByCategory,
      recentMovements,
      pendingReturns,
      alerts,
      aiRecommendations: invAnalytics.productAnalytics,
    };

    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Inventory dashboard fetched', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch inventory dashboard');
  }
};

// GET /api/dashboard/marketing
export const getMarketingDashboard = async (req, res) => {
  try {
    const cacheKey = 'dashboard:marketing';
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Marketing dashboard fetched (instant cache)', cached);
    }

    const [contents, campaigns] = await Promise.all([
      MarketingContent.find().sort({ createdAt: -1 }).lean(),
      Campaign.find().sort({ createdAt: -1 }).lean(),
    ]);

    const totalContents = contents.length;
    const submittedContents = contents.filter((c) => c.status === 'Submitted').length;
    const approvedContents = contents.filter((c) => c.status === 'Approved').length;
    const publishedContents = contents.filter((c) => c.status === 'Published').length;

    const totalCampaigns = campaigns.length;
    const draftCampaigns = campaigns.filter((c) => c.status === 'Draft').length;
    const scheduledCampaigns = campaigns.filter((c) => c.status === 'Scheduled').length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
    const completedCampaigns = campaigns.filter((c) => c.status === 'Completed').length;

    const contentTypeMap = {};
    contents.forEach((c) => {
      const type = c.contentType || 'General';
      contentTypeMap[type] = (contentTypeMap[type] || 0) + 1;
    });

    const contentByType = Object.keys(contentTypeMap).map((type) => ({
      name: type,
      count: contentTypeMap[type],
    }));

    const campaignStatusBreakdown = [
      { name: 'Draft', count: draftCampaigns },
      { name: 'Scheduled', count: scheduledCampaigns },
      { name: 'Active', count: activeCampaigns },
      { name: 'Completed', count: completedCampaigns },
    ];

    const payload = {
      summary: {
        totalContents,
        submittedContents,
        approvedContents,
        publishedContents,
        totalCampaigns,
        activeCampaigns,
        scheduledCampaigns,
        completedCampaigns,
      },
      contentByType,
      campaignStatusBreakdown,
      recentContents: contents.slice(0, 10),
      recentCampaigns: campaigns.slice(0, 5),
    };

    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Marketing dashboard fetched', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch marketing dashboard');
  }
};

// GET /api/dashboard/customer
export const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const cacheKey = `dashboard:customer:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, true, 'Customer dashboard fetched (instant cache)', cached);
    }

    const [user, userOrders, userReturns] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      Order.find({ customer: userId })
        .populate({ path: 'items.product', select: 'name sku price images categoryName brand sizes' })
        .sort({ createdAt: -1 })
        .lean(),
      Return.find(req.user?.role === 'customer' ? { customer: userId } : {})
        .populate('product', 'name price images')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    let orders = userOrders;
    if (orders.length === 0 && req.user?.role !== 'customer') {
      orders = await Order.find()
        .populate({ path: 'items.product', select: 'name sku price images categoryName brand sizes' })
        .sort({ createdAt: -1 })
        .lean();
    }

    const returns = userReturns;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Packed' || o.status === 'Shipped').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
    const totalReturns = returns.length;

    const payload = {
      profile: user,
      summary: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalReturns,
      },
      recentOrders: orders,
      returns,
    };

    cache.set(cacheKey, payload, 30);
    return sendResponse(res, 200, true, 'Customer dashboard fetched', payload);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch customer dashboard');
  }
};
