import api from './api';

export const productStrategyService = {
  getStrategy: async () => {
    const response = await api.get('/product-strategy');
    return response.data;
  },

  saveStrategy: async (data) => {
    const response = await api.post('/product-strategy/save', data);
    return response.data;
  },

  generateNames: async (userHint = '') => {
    const response = await api.post('/product-strategy/generate-names', { userHint });
    return response.data;
  },

  generateDescription: async (payload) => {
    const response = await api.post('/product-strategy/generate-description', payload);
    return response.data;
  },

  generateUSP: async (payload) => {
    const response = await api.post('/product-strategy/generate-usp', payload);
    return response.data;
  },

  generatePositioning: async (payload) => {
    const response = await api.post('/product-strategy/generate-positioning', payload);
    return response.data;
  },

  generateAllChained: async (userHint = '') => {
    const response = await api.post('/product-strategy/generate-all', { userHint });
    return response.data;
  },

  generateProductStrategy: async (payload) => {
    const productIdea = typeof payload === 'string' ? payload : (payload?.productIdea || payload?.userHint || '');
    const response = await api.post('/product-strategy/generate-product-strategy', { productIdea, userHint: productIdea });
    return response.data;
  },
};
