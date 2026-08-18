import api from './api';

export const brandService = {
  getIdentity: async () => {
    const response = await api.get('/brand/identity');
    return response.data;
  },

  generateInsights: async () => {
    const response = await api.post('/brand/generate-insights');
    return response.data;
  },

  generateBrand: async (data) => {
    const response = await api.post('/brand/generate', data);
    return response.data;
  },

  saveBrandIdentity: async (data) => {
    const response = await api.post('/brand/generate', data);
    return response.data;
  },

  // 6 Section-specific AI Generation APIs
  generateBrandName: async () => {
    const response = await api.post('/ai/brand-name');
    return response.data;
  },

  generateTagline: async (context) => {
    const response = await api.post('/ai/tagline', context);
    return response.data;
  },

  generateMission: async (context) => {
    const response = await api.post('/ai/mission', context);
    return response.data;
  },

  generateVision: async (context) => {
    const response = await api.post('/ai/vision', context);
    return response.data;
  },

  generateBrandStory: async (context) => {
    const response = await api.post('/ai/brand-story', context);
    return response.data;
  },

  generateBrandPersonality: async (context) => {
    const response = await api.post('/ai/brand-personality', context);
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get('/brand/projects');
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/brand/projects', projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/brand/projects/${id}`);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get('/brand/reports');
    return response.data;
  },
};
