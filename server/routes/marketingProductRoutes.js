import { Router } from 'express';
import {
  getMarketingProducts,
  getMarketingProductById,
  createMarketingProduct,
  updateMarketingProduct,
  deleteMarketingProduct,
  generateProductStrategyFromIdeaController,
  regenerateStrategySectionFromIdeaController,
  saveProductStrategyController,
  getLatestProductStrategyController,
  generateAdPosterController,
  getAdPosterController,
  regenerateAdPosterController,
  saveAdPosterController,
} from '../controllers/marketingProductController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'marketing_staff', 'startup_owner'));

// REST Product CRUD
router.get('/', getMarketingProducts);
router.get('/strategy/latest', getLatestProductStrategyController);
router.get('/:id', getMarketingProductById);
router.post('/', createMarketingProduct);
router.put('/:id', updateMarketingProduct);
router.delete('/:id', deleteMarketingProduct);

// Gemini AI Product Strategy Routes
router.post('/strategy/generate', generateProductStrategyFromIdeaController);
router.post('/strategy/regenerate-section', regenerateStrategySectionFromIdeaController);
router.post('/strategy/save', saveProductStrategyController);

// AI Ad Poster Generation Routes
router.post('/:id/generate-ad-poster', generateAdPosterController);
router.get('/:id/ad-poster', getAdPosterController);
router.post('/:id/regenerate-ad-poster', regenerateAdPosterController);
router.post('/:id/save-ad-poster', saveAdPosterController);

export default router;


