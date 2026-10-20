import { Router } from 'express';
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  generateBrandAI,
  generateBrandSectionAIController,
} from '../controllers/brandController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'marketing_staff', 'startup_owner'));

// REST Brand CRUD
router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

// Gemini Brand AI Generation
router.post('/ai/generate', generateBrandAI);
router.post('/ai/generate/:sectionKey', generateBrandSectionAIController);

export default router;
