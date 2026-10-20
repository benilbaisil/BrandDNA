import express from 'express';
import {
  getMarketingContents,
  submitMarketingContent,
  approveMarketingContent,
  getCampaigns,
  createCampaign,
  generateMarketingBrandAI,
  generateMarketingProductAI,
  generateProductImageFromUrlController,
  generateProductImageFromStoreController,
} from '../controllers/marketingController.js';
import {
  generateAdPosterController,
  getAdPosterController,
  regenerateAdPosterController,
  saveAdPosterController,
} from '../controllers/marketingProductController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/content', protect, authorize('admin', 'marketing_staff', 'customer'), getMarketingContents);
router.post('/content', protect, authorize('marketing_staff', 'admin', 'customer'), submitMarketingContent);
router.put('/content/:id/approve', protect, authorize('admin'), approveMarketingContent);

router.get('/campaigns', protect, authorize('admin', 'marketing_staff', 'customer'), getCampaigns);
router.post('/campaigns', protect, authorize('marketing_staff', 'admin', 'customer'), createCampaign);

router.post('/generate-brand', protect, authorize('marketing_staff', 'admin', 'customer'), generateMarketingBrandAI);
router.post('/generate-product', protect, authorize('marketing_staff', 'admin', 'customer'), generateMarketingProductAI);
router.post('/generate-image-from-url', protect, authorize('marketing_staff', 'admin', 'customer'), generateProductImageFromUrlController);
router.post('/generate-image-from-product', protect, authorize('marketing_staff', 'admin', 'customer'), generateProductImageFromStoreController);

// AI Ad Poster Endpoints under /api/marketing/products/:id/...
router.post('/products/:id/generate-ad-poster', protect, authorize('marketing_staff', 'admin'), generateAdPosterController);
router.get('/products/:id/ad-poster', protect, authorize('marketing_staff', 'admin'), getAdPosterController);
router.post('/products/:id/regenerate-ad-poster', protect, authorize('marketing_staff', 'admin'), regenerateAdPosterController);
router.post('/products/:id/save-ad-poster', protect, authorize('marketing_staff', 'admin'), saveAdPosterController);

export default router;


