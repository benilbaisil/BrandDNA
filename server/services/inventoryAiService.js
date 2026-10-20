import { Product } from '../models/Product.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { Order } from '../models/Order.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

/**
 * Real DB Inventory Intelligence Calculations
 */
export const calculateInventoryAnalytics = async () => {
  const products = await Product.find({ status: 'Active' }).populate('category');
  
  // Get sales transactions for past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const saleTransactions = await InventoryTransaction.find({
    transactionType: 'Sale',
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Calculate sales per product in last 30 days
  const salesMap = {};
  saleTransactions.forEach((tx) => {
    const pId = tx.product.toString();
    salesMap[pId] = (salesMap[pId] || 0) + tx.quantity;
  });

  const productAnalytics = products.map((p) => {
    const pId = p._id.toString();
    const unitsSold30d = salesMap[pId] || 0;
    const avgDailySales = unitsSold30d > 0 ? parseFloat((unitsSold30d / 30).toFixed(2)) : 0.1; // minimum velocity
    const daysOfSupplyRemaining = avgDailySales > 0 ? Math.round(p.stock / avgDailySales) : 999;
    const leadTime = p.leadTimeDays || 5;
    const isLowStock = p.stock <= (p.reorderLevel || 10) || daysOfSupplyRemaining <= (leadTime + 2);
    const isOverstock = p.stock > (p.targetStockLevel || 50) && daysOfSupplyRemaining > 60;
    const isSlowMoving = unitsSold30d <= 2 && p.stock > 15;
    const isDeadStock = unitsSold30d === 0 && p.stock > 20;

    let reorderQuantity = 0;
    if (isLowStock) {
      const targetLevel = p.targetStockLevel || 50;
      reorderQuantity = Math.max(0, targetLevel - p.stock);
    }

    return {
      productId: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || 'General',
      currentStock: p.stock,
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

  const lowStockItems = productAnalytics.filter((p) => p.isLowStock);
  const overstockItems = productAnalytics.filter((p) => p.isOverstock);
  const slowMovingItems = productAnalytics.filter((p) => p.isSlowMoving || p.isDeadStock);

  return {
    productAnalytics,
    lowStockItems,
    overstockItems,
    slowMovingItems,
  };
};

/**
 * Generate AI Insights interpreting real calculated database metrics using Gemini API
 */
export const generateAIInventoryInsights = async () => {
  const analytics = await calculateInventoryAnalytics();
  const { lowStockItems, overstockItems, slowMovingItems, productAnalytics } = analytics;

  if (productAnalytics.length === 0) {
    return {
      analytics,
      aiSummary: 'No active products available in the database for inventory AI analysis.',
      recommendations: [],
    };
  }

  const aiClient = getAIClient();
  let aiSummary = 'Calculated inventory analysis based on real transaction history.';
  let recommendations = [];

  if (aiClient) {
    try {
      const prompt = `
You are an expert Supply Chain & AI Inventory Operations Specialist.
Analyze the following real inventory dataset from our MongoDB database:

Total Active SKUs: ${productAnalytics.length}
Low Stock Alert Items: ${JSON.stringify(lowStockItems.map(i => ({ name: i.name, stock: i.currentStock, dailySales: i.avgDailySales, daysLeft: i.daysOfSupplyRemaining, suggestedReorder: i.reorderQuantity })))}
Overstock Items: ${JSON.stringify(overstockItems.map(i => ({ name: i.name, stock: i.currentStock, daysOfSupply: i.daysOfSupplyRemaining })))}
Slow Moving / Dead Stock Items: ${JSON.stringify(slowMovingItems.map(i => ({ name: i.name, stock: i.currentStock, sold30d: i.unitsSold30d })))}

Generate a response strictly in JSON format with two keys:
1. "summary": A 2-3 sentence clear operational summary of current inventory health.
2. "recommendations": An array of object recommendations with keys "type" (LowStock|Overstock|SlowMovers|Optimization), "title", "action", and "priority" (High|Medium|Low).

Example format:
{
  "summary": "Our inventory status requires immediate reordering for low-stock SKUs...",
  "recommendations": [
    { "type": "LowStock", "title": "Replenish Critical SKU", "action": "Product X has only 5 days of supply left...", "priority": "High" }
  ]
}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let text = response.text || '';
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.summary) aiSummary = parsed.summary;
      if (Array.isArray(parsed.recommendations)) recommendations = parsed.recommendations;
    } catch (err) {
      console.warn('Gemini AI Inventory analysis fallback:', err.message);
    }
  }

  // Fallback programmatic recommendations if AI is offline or failed
  if (recommendations.length === 0) {
    lowStockItems.forEach((item) => {
      recommendations.push({
        type: 'LowStock',
        title: `Low Stock Alert: ${item.name}`,
        action: `${item.name} (SKU: ${item.sku}) has current stock of ${item.currentStock} units with avg daily sales of ${item.avgDailySales}. Estimated stock depletion in ~${item.daysOfSupplyRemaining} days. Consider reordering ${item.reorderQuantity} units.`,
        priority: 'High',
      });
    });

    overstockItems.forEach((item) => {
      recommendations.push({
        type: 'Overstock',
        title: `Overstock Risk: ${item.name}`,
        action: `${item.name} has ${item.currentStock} units in stock representing ${item.daysOfSupplyRemaining} days of supply. Consider running a promotional discount.`,
        priority: 'Medium',
      });
    });
  }

  return {
    analytics,
    aiSummary,
    recommendations,
  };
};
