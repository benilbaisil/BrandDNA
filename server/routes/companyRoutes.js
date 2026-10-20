import express from 'express';
import { getCompany, updateCompany } from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCompany);
router.put('/', protect, authorize('admin'), updateCompany);

export default router;
