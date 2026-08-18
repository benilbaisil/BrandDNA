import { Router } from 'express';
import {
  getBrandIdentity,
  generateAIInsights,
  generateBrandDNA,
  getUserProjects,
  createUserProject,
  deleteUserProject,
  getUserReports,
} from '../controllers/brandController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/identity', getBrandIdentity);
router.post('/generate-insights', generateAIInsights);
router.post('/generate', generateBrandDNA);

router.get('/projects', getUserProjects);
router.post('/projects', createUserProject);
router.delete('/projects/:id', deleteUserProject);

router.get('/reports', getUserReports);

export default router;
