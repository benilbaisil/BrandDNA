import api from './api';

export const businessService = {
  // Centralized Dashboard Telemetry APIs
  getAdminDashboard: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },
  getInventoryDashboard: async () => {
    const res = await api.get('/dashboard/inventory');
    return res.data;
  },
  getMarketingDashboard: async () => {
    const res = await api.get('/dashboard/marketing');
    return res.data;
  },
  getCustomerDashboard: async () => {
    const res = await api.get('/dashboard/customer');
    return res.data;
  },
  
  // Wishlist
  getWishlist: async () => {
    const res = await api.get('/auth/wishlist');
    return res.data;
  },
  toggleWishlist: async (productId) => {
    const res = await api.post(`/auth/wishlist/${productId}`);
    return res.data;
  },

  // Products & Categories
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },

  // Inventory Product Ad Posters (Cloud Generated)
  generateProductAdPoster: async (id) => {
    const res = await api.post(`/products/${id}/generate-ad-poster`);
    return res.data;
  },
  getProductAdPoster: async (id) => {
    const res = await api.get(`/products/${id}/ad-poster`);
    return res.data;
  },
  regenerateProductAdPoster: async (id) => {
    const res = await api.post(`/products/${id}/regenerate-ad-poster`);
    return res.data;
  },
  saveProductAdPoster: async (id, data) => {
    const res = await api.post(`/products/${id}/save-ad-poster`, data);
    return res.data;
  },

  // Inventory & AI Intelligence
  getInventorySummary: async () => {
    const res = await api.get('/inventory/summary');
    return res.data;
  },
  getInventoryDashboardStats: async () => {
    const res = await api.get('/inventory/dashboard-stats');
    return res.data;
  },
  getInventoryLedger: async (params = {}) => {
    const res = await api.get('/inventory/ledger', { params });
    return res.data;
  },
  stockIn: async (data) => {
    const res = await api.post('/inventory/stock-in', data);
    return res.data;
  },
  stockOut: async (data) => {
    const res = await api.post('/inventory/stock-out', data);
    return res.data;
  },
  recordDamage: async (data) => {
    const res = await api.post('/inventory/damage', data);
    return res.data;
  },
  adjustStock: async (data) => {
    const res = await api.post('/inventory/adjust', data);
    return res.data;
  },
  getInventoryReports: async () => {
    const res = await api.get('/inventory/reports');
    return res.data;
  },
  getInventoryIntelligence: async () => {
    const res = await api.get('/inventory/intelligence');
    return res.data;
  },

  // Purchases & Suppliers
  getPurchaseOrders: async () => {
    const res = await api.get('/purchases');
    return res.data;
  },
  createPurchaseOrder: async (data) => {
    const res = await api.post('/purchases', data);
    return res.data;
  },
  receivePurchaseOrder: async (id) => {
    const res = await api.put(`/purchases/${id}/receive`);
    return res.data;
  },
  getSuppliers: async () => {
    const res = await api.get('/purchases/suppliers');
    return res.data;
  },
  createSupplier: async (data) => {
    const res = await api.post('/purchases/suppliers', data);
    return res.data;
  },

  // Orders
  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  createOrder: async (data) => {
    const res = await api.post('/orders', data);
    return res.data;
  },
  updateOrderStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },
  trackOrder: async (id) => {
    const res = await api.get(`/orders/${id}/track`);
    return res.data;
  },
  retryShipment: async (id) => {
    const res = await api.post(`/orders/${id}/retry-shipment`);
    return res.data;
  },

  // Returns
  getReturns: async () => {
    const res = await api.get('/returns');
    return res.data;
  },
  createReturn: async (data) => {
    const res = await api.post('/returns', data);
    return res.data;
  },
  processReturn: async (id, data) => {
    const res = await api.put(`/returns/${id}/process`, data);
    return res.data;
  },

  // Marketing & Campaigns
  getMarketingContents: async (params = {}) => {
    const res = await api.get('/marketing/content', { params });
    return res.data;
  },
  submitMarketingContent: async (data) => {
    const res = await api.post('/marketing/content', data);
    return res.data;
  },
  approveMarketingContent: async (id, data) => {
    const res = await api.put(`/marketing/content/${id}/approve`, data);
    return res.data;
  },
  getCampaigns: async () => {
    const res = await api.get('/marketing/campaigns');
    return res.data;
  },
  createCampaign: async (data) => {
    const res = await api.post('/marketing/campaigns', data);
    return res.data;
  },
  generateMarketingBrandAI: async (data = {}) => {
    const res = await api.post('/marketing/generate-brand', data);
    return res.data;
  },
  generateMarketingProductAI: async (data = {}) => {
    const res = await api.post('/marketing/generate-product', data);
    return res.data;
  },

  // Company
  getCompany: async () => {
    const res = await api.get('/company');
    return res.data;
  },
};

