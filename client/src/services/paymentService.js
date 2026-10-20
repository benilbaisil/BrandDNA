import api from './api';

export const paymentService = {
  /**
   * Request Razorpay Order creation from backend
   * @param {Object} data - { items: Array, shippingAddress: Object }
   */
  createPaymentOrder: async (data) => {
    const res = await api.post('/payment/create-order', data);
    return res.data;
  },

  /**
   * Verify Razorpay Payment Signature on server
   * @param {Object} data - { razorpay_payment_id, razorpay_order_id, razorpay_signature, items, shippingAddress }
   */
  verifyPayment: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },

  /**
   * Generate HMAC signature for test mode checkout simulation
   * @param {Object} data - { razorpay_order_id, razorpay_payment_id }
   */
  generateTestSignature: async (data) => {
    const res = await api.post('/payment/generate-test-signature', data);
    return res.data;
  },
};
