import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Return } from '../models/Return.js';
import { Campaign } from '../models/Campaign.js';
import { MarketingContent } from '../models/MarketingContent.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { getInventoryValuationSummary, getInventoryLedger } from '../services/inventoryService.js';
import { calculateInventoryAnalytics } from '../services/inventoryAiService.js';
import { getRecentActivities } from '../services/activityService.js';
import { sendResponse } from '../utils/apiResponse.js';

// GET /api/dashboard/admin
export const getAdminDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ status: { $ne: 'Discontinued' } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    const returns = await Return.find();
    const campaigns = await Campaign.find();
    const invSummary = await getInventoryValuationSummary();
    const invAnalytics = await calculateInventoryAnalytics();

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Packed').length;
    const pendingReturns = returns.filter((r) => r.status === 'Pending').length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;

    // Out of stock count
    const outOfStockProducts = await Product.countDocuments({ stock: 0, status: { $ne: 'Discontinued' } });

    // Sales Overview (Today, This Week, This Month)
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

    // Sales Trend (Past 7 Days Data Points)
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

    // Order Status Summary & Category Breakdown
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
      // Status count
      if (orderStatusCounts[o.status] !== undefined) {
        orderStatusCounts[o.status] += 1;
      }

      // Payment status count & revenue
      const pStatus = o.paymentStatus || 'Paid';
      if (paymentStatusCounts[pStatus]) {
        paymentStatusCounts[pStatus].count += 1;
        paymentStatusCounts[pStatus].revenue += o.totalAmount || 0;
      }

      // Items & Products Sold Breakdown
      o.items?.forEach((item) => {
        const pName = item.productName || item.product?.name || 'Product';
        const catName = item.product?.categoryName || item.product?.category?.name || 'General';
        const qty = item.quantity || 1;
        const rev = item.totalPrice || ((item.unitPrice || 0) * qty);

        totalProductsSoldQuantity += qty;

        // Product Breakdown
        if (!productSalesMap[pName]) {
          productSalesMap[pName] = { name: pName, quantitySold: 0, revenue: 0, image: item.product?.images?.[0] || '' };
        }
        productSalesMap[pName].quantitySold += qty;
        productSalesMap[pName].revenue += rev;

        // Category Breakdown
        if (!categorySalesMap[catName]) {
          categorySalesMap[catName] = { name: catName, quantitySold: 0, revenue: 0 };
        }
        categorySalesMap[catName].quantitySold += qty;
        categorySalesMap[catName].revenue += rev;
      });
    });

    const orderStatusSummary = Object.keys(orderStatusCounts).map((status) => ({
      name: status,
      count: orderStatusCounts[status],
    }));

    const productSalesList = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);
    const categorySalesList = Object.values(categorySalesMap).sort((a, b) => b.revenue - a.revenue);
    const topProducts = productSalesList.slice(0, 5);

    // Pending Marketing Content for Approval
    const pendingMarketingContents = await MarketingContent.find({ status: 'Submitted' })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    // Recent System Activity
    const recentActivities = await getRecentActivities(10);

    return sendResponse(res, 200, true, 'Admin dashboard data fetched successfully', {
      summary: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSales,
        totalProductsSoldQuantity,
        currentInventoryValue: invSummary.totalCostValuation,
        retailInventoryValue: invSummary.totalRetailValuation,
        lowStockProducts: invSummary.lowStockCount,
        outOfStockProducts,
        pendingOrders,
        confirmedOrders: orderStatusCounts.Confirmed,
        shippedOrders: orderStatusCounts.Shipped,
        deliveredOrders: orderStatusCounts.Delivered,
        cancelledOrders: orderStatusCounts.Cancelled,
        returnedOrders: orderStatusCounts.Returned || returns.length,
        pendingReturns,
        activeCampaigns,
      },
      salesOverview: {
        today: salesToday,
        thisWeek: salesThisWeek,
        thisMonth: salesThisMonth,
        salesTrend,
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
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch admin dashboard');
  }
};

// GET /api/dashboard/inventory
export const getInventoryDashboard = async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: 'Discontinued' } }).populate('category');
    const invSummary = await getInventoryValuationSummary();
    const invAnalytics = await calculateInventoryAnalytics();
    const recentMovements = await getInventoryLedger({}, 15);
    const pendingReturns = await Return.find({ status: 'Approved', inspectStatus: 'PendingInspection' })
      .populate('order', 'orderNumber')
      .populate('product', 'name sku price stock')
      .populate('customer', 'fullName email');

    const outOfStockProducts = products.filter((p) => p.stock === 0);

    // Stock distribution by category
    const categoryMap = {};
    products.forEach((p) => {
      const catName = p.category?.name || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, productCount: 0, stockUnits: 0, valuation: 0 };
      }
      categoryMap[catName].productCount += 1;
      categoryMap[catName].stockUnits += p.stock;
      categoryMap[catName].valuation += p.stock * p.cost;
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

    return sendResponse(res, 200, true, 'Inventory dashboard fetched', {
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
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch inventory dashboard');
  }
};

// GET /api/dashboard/marketing
export const getMarketingDashboard = async (req, res) => {
  try {
    const contents = await MarketingContent.find().populate('createdBy', 'fullName email').sort({ createdAt: -1 });
    const campaigns = await Campaign.find().populate('createdBy', 'fullName email').sort({ createdAt: -1 });

    const totalContents = contents.length;
    const submittedContents = contents.filter((c) => c.status === 'Submitted').length;
    const approvedContents = contents.filter((c) => c.status === 'Approved').length;
    const publishedContents = contents.filter((c) => c.status === 'Published').length;

    const totalCampaigns = campaigns.length;
    const draftCampaigns = campaigns.filter((c) => c.status === 'Draft').length;
    const scheduledCampaigns = campaigns.filter((c) => c.status === 'Scheduled').length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
    const completedCampaigns = campaigns.filter((c) => c.status === 'Completed').length;

    // Generated content distribution by type
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

    return sendResponse(res, 200, true, 'Marketing dashboard fetched', {
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
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch marketing dashboard');
  }
};

// GET /api/dashboard/customer
export const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).select('-password');
    const orders = await Order.find({ customer: userId }).populate('items.product').sort({ createdAt: -1 });
    const returns = await Return.find({ customer: userId }).populate('product', 'name price images').sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Packed' || o.status === 'Shipped').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
    const totalReturns = returns.length;

    return sendResponse(res, 200, true, 'Customer dashboard fetched', {
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
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch customer dashboard');
  }
};
