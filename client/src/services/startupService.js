import api from './api';

export const startupService = {
  getProfile: async () => {
    const response = await api.get('/startup');
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await api.post('/startup', profileData);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/startup', profileData);
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/startup');
    return response.data;
  },
};
