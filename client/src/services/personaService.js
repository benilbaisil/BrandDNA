import api from './api';

export const personaService = {
  getPersonas: async () => {
    const response = await api.get('/customer-persona');
    return response.data;
  },

  generatePersonas: async (userHint = '') => {
    try {
      const response = await api.post('/customer-persona/generate-personas', { userHint, productIdea: userHint });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const response = await api.post('/generate-personas', { userHint, productIdea: userHint });
        return response.data;
      }
      throw err;
    }
  },

  savePersonas: async (personas) => {
    const response = await api.post('/customer-persona/save', { personas });
    return response.data;
  },
};

export default personaService;
