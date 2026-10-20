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

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Inventory Product Ad Poster Endpoints
router.get('/:id/ad-poster', getProductAdPosterController);
router.post('/:id/generate-ad-poster', optionalProtect, generateProductAdPosterController);
router.post('/:id/regenerate-ad-poster', optionalProtect, regenerateProductAdPosterController);
router.post('/:id/save-ad-poster', protect, authorize('admin', 'inventory_staff', 'marketing_staff', 'customer', 'startup_owner'), saveProductAdPosterController);

router.post('/', protect, authorize('admin', 'inventory_staff', 'marketing_staff'), createProduct);
router.put('/:id', protect, authorize('admin', 'inventory_staff', 'marketing_staff'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'inventory_staff', 'marketing_staff'), deleteProduct);

router.post('/categories', protect, authorize('admin', 'inventory_staff', 'marketing_staff'), createCategory);

export default router;
