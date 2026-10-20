import api from './api';

export const brandService = {
  // Get all user brands
  getBrands: async () => {
    const res = await api.get('/brands');
    return res.data;
  },

  // Get brand by ID (including products under this brand)
  getBrandById: async (id) => {
    const res = await api.get(`/brands/${id}`);
    return res.data;
  },

  // Create new brand
  createBrand: async (data) => {
    const res = await api.post('/brands', data);
    return res.data;
  },

  // Update existing brand
  updateBrand: async (id, data) => {
    const res = await api.put(`/brands/${id}`, data);
    return res.data;
  },

  // Delete brand
  deleteBrand: async (id) => {
    const res = await api.delete(`/brands/${id}`);
    return res.data;
  },

  // Generate full Brand Identity using Gemini AI
  generateBrandAI: async (data) => {
    const res = await api.post('/brands/ai/generate', data);
    return res.data;
  },

  // Generate specific brand section AI
  generateBrandSectionAI: async (sectionKey, data) => {
    const res = await api.post(`/brands/ai/generate/${sectionKey}`, data);
    return res.data;
  },
};
