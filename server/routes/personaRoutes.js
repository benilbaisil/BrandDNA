import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPersonas,
  generatePersonas,
  savePersonas,
} from '../controllers/personaController.js';

const router = Router();

router.use(protect);

router.get('/', getPersonas);
router.post('/save', savePersonas);
router.post('/generate-personas', generatePersonas);

export default router;
