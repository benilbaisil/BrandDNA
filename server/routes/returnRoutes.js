import express from 'express';
import {
  getReturns,
  createReturn,
  processReturn,
} from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getReturns);
router.post('/', protect, authorize('customer', 'admin'), createReturn);
router.put('/:id/process', protect, authorize('admin', 'inventory_staff'), processReturn);

export default router;
