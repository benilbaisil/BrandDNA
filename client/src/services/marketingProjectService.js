import api from './api';

export const marketingProjectService = {
  // Get all marketing projects from MongoDB
  getProjects: async () => {
    const res = await api.get('/marketing-projects');
    return res.data;
  },

  // Create a new marketing project from product idea
  createProject: async (data) => {
    const res = await api.post('/marketing-projects', data);
    return res.data;
  },

  // Get single project details
  getProjectById: async (id) => {
    const res = await api.get(`/marketing-projects/${id}`);
    return res.data;
  },

  // Update project (manual edits or selected items)
  updateProject: async (id, data) => {
    const res = await api.put(`/marketing-projects/${id}`, data);
    return res.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const res = await api.delete(`/marketing-projects/${id}`);
    return res.data;
  },

  // Generate specific section AI dynamically based on product idea
  generateModuleAI: async (id, moduleKey, data = {}) => {
    const res = await api.post(`/marketing-projects/${id}/generate/${moduleKey}`, data);
    return res.data;
  },
};
