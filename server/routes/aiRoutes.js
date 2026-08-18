import { Router } from 'express';
import {
  generateBrandName,
  generateTagline,
  generateMission,
  generateVision,
  generateBrandStory,
  generateBrandPersonality,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/brand-name', generateBrandName);
router.post('/tagline', generateTagline);
router.post('/mission', generateMission);
router.post('/vision', generateVision);
router.post('/brand-story', generateBrandStory);
router.post('/brand-personality', generateBrandPersonality);

export default router;
