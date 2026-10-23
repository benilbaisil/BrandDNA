import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  generateProductAdPosterController,
  getProductAdPosterController,
  regenerateProductAdPosterController,
  saveProductAdPosterController,
} from '../controllers/productController.js';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getProducts);
router.get('/categories', getCategories);
router.get('/:id', optionalProtect, getProductById);

// Inventory Product Ad Poster Endpoints (Marketing Staff & Admin Only)
router.get('/:id/ad-poster', protect, authorize('marketing_staff', 'admin'), getProductAdPosterController);
router.post('/:id/generate-ad-poster', protect, authorize('marketing_staff', 'admin'), generateProductAdPosterController);
router.post('/:id/regenerate-ad-poster', protect, authorize('marketing_staff', 'admin'), regenerateProductAdPosterController);
router.post('/:id/save-ad-poster', protect, authorize('marketing_staff', 'admin'), saveProductAdPosterController);

router.post('/', protect, authorize('admin', 'inventory_staff'), createProduct);
router.put('/:id', protect, authorize('admin', 'inventory_staff'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'inventory_staff'), deleteProduct);

router.post('/categories', protect, authorize('admin', 'inventory_staff'), createCategory);

export default router;
