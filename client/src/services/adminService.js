import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/status`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getStartups: async () => {
    const response = await api.get('/admin/startups');
    return response.data;
  },

  deleteStartup: async (id) => {
    const response = await api.delete(`/admin/startups/${id}`);
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get('/admin/projects');
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/admin/projects/${id}`);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  generateReports: async () => {
    const response = await api.post('/admin/reports/generate');
    return response.data;
  },

  getUserReport: async (userId) => {
    const response = await api.get(`/admin/reports/user/${userId}`);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data;
  },

  getActivities: async () => {
    const response = await api.get('/admin/activities');
    return response.data;
  },

  getIndustryAnalytics: async () => {
    const response = await api.get('/admin/industry-analytics');
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.put('/admin/settings', settingsData);
    return response.data;
  },
};
