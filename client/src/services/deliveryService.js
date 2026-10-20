import api from './api';

export const deliveryService = {
  // Admin Methods
  getDeliveryAgents: async () => {
    const res = await api.get('/delivery/admin/agents');
    return res.data;
  },

  createDeliveryAgent: async (agentData) => {
    const res = await api.post('/delivery/admin/agents', agentData);
    return res.data;
  },

  getDeliveryAgentById: async (id) => {
    const res = await api.get(`/delivery/admin/agents/${id}`);
    return res.data;
  },

  updateDeliveryAgent: async (id, agentData) => {
    const res = await api.put(`/delivery/admin/agents/${id}`, agentData);
    return res.data;
  },

  toggleDeliveryAgentStatus: async (id) => {
    const res = await api.patch(`/delivery/admin/agents/${id}/status`);
    return res.data;
  },

  assignDeliveryAgent: async (orderId, deliveryAgentId) => {
    const res = await api.post(`/delivery/admin/orders/${orderId}/assign`, { deliveryAgentId });
    return res.data;
  },

  reassignDeliveryAgent: async (orderId, deliveryAgentId) => {
    const res = await api.post(`/delivery/admin/orders/${orderId}/reassign`, { deliveryAgentId });
    return res.data;
  },

  // Delivery Agent Methods
  getAssignedOrders: async (statusFilter = 'ALL') => {
    const res = await api.get('/delivery/agent/orders', { params: { status: statusFilter } });
    return res.data;
  },

  getAgentStats: async () => {
    const res = await api.get('/delivery/agent/stats');
    return res.data;
  },

  toggleAgentAvailability: async () => {
    const res = await api.patch('/delivery/agent/availability');
    return res.data;
  },

  getAgentOrderDetails: async (orderId) => {
    const res = await api.get(`/delivery/agent/orders/${orderId}`);
    return res.data;
  },

  acceptDelivery: async (orderId) => {
    const res = await api.post(`/delivery/agent/orders/${orderId}/accept`);
    return res.data;
  },

  pickupOrder: async (orderId) => {
    const res = await api.post(`/delivery/agent/orders/${orderId}/pickup`);
    return res.data;
  },

  startDelivery: async (orderId) => {
    const res = await api.post(`/delivery/agent/orders/${orderId}/start-delivery`);
    return res.data;
  },

  confirmDelivery: async (orderId, otp, note = '') => {
    const res = await api.post(`/delivery/agent/orders/${orderId}/confirm-delivery`, { otp, note });
    return res.data;
  },

  failDelivery: async (orderId, reason, note = '') => {
    const res = await api.post(`/delivery/agent/orders/${orderId}/fail-delivery`, { reason, note });
    return res.data;
  },

  // Customer & Common Tracking
  getDeliveryTracking: async (orderId) => {
    const res = await api.get(`/delivery/tracking/${orderId}`);
    return res.data;
  },
};
