import api from './api';

export const marketingProductService = {
  // Get all marketing products (optionally filter by brandId)
  getProducts: async (brandId = '') => {
    const url = brandId ? `/marketing-products?brandId=${brandId}` : '/marketing-products';
    const res = await api.get(url);
    return res.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const res = await api.get(`/marketing-products/${id}`);
    return res.data;
  },

  // Create new product under a brand
  createProduct: async (data) => {
    const res = await api.post('/marketing-products', data);
    return res.data;
  },

  // Update product
  updateProduct: async (id, data) => {
    const res = await api.put(`/marketing-products/${id}`, data);
    return res.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const res = await api.delete(`/marketing-products/${id}`);
    return res.data;
  },

  // Generate Product Strategy dynamically from Product Idea
  generateStrategyFromIdea: async (productIdea) => {
    const res = await api.post('/marketing-products/strategy/generate', { productIdea });
    return res.data;
  },

  // Regenerate a specific strategy section (naming, usp, pricing, positioning, packaging)
  regenerateStrategySection: async (sectionKey, productIdea, productName = '') => {
    const res = await api.post('/marketing-products/strategy/regenerate-section', {
      sectionKey,
      productIdea,
      productName,
    });
    return res.data;
  },

  // Save Product Strategy to MongoDB
  saveStrategy: async (data) => {
    const res = await api.post('/marketing-products/strategy/save', data);
    return res.data;
  },

  // Get Latest Saved Product Strategy
  getLatestStrategy: async () => {
    const res = await api.get('/marketing-products/strategy/latest');
    return res.data;
  },

  // Generate AI Ad Poster for saved product ID
  generateAdPoster: async (productId) => {
    const res = await api.post(`/marketing-products/${productId}/generate-ad-poster`);
    return res.data;
  },

  // Get saved Ad Poster for product ID
  getAdPoster: async (productId) => {
    const res = await api.get(`/marketing-products/${productId}/ad-poster`);
    return res.data;
  },

  // Regenerate AI Ad Poster for product ID
  regenerateAdPoster: async (productId) => {
    const res = await api.post(`/marketing-products/${productId}/regenerate-ad-poster`);
    return res.data;
  },

  // Save customized Ad Poster metadata for product ID
  saveAdPoster: async (productId, data) => {
    const res = await api.post(`/marketing-products/${productId}/save-ad-poster`, data);
    return res.data;
  },
};


