import express from 'express';
import { createPaymentOrder, verifyPayment, generateTestSignature } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/generate-test-signature', protect, generateTestSignature);

export default router;
