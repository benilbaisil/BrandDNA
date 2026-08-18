import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStrategy,
  saveStrategy,
  generateNames,
  generateDescription,
  generateUSP,
  generatePositioning,
  generateAllChained,
} from '../controllers/productStrategyController.js';

const router = Router();

router.use(protect);

router.get('/', getStrategy);
router.post('/save', saveStrategy);
router.post('/generate-names', generateNames);
router.post('/generate-description', generateDescription);
router.post('/generate-usp', generateUSP);
router.post('/generate-positioning', generatePositioning);
router.post('/generate-all', generateAllChained);
router.post('/generate-product-strategy', generateAllChained);

export default router;
