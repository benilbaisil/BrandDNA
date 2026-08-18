import { Router } from 'express';
import { generateBrandDNA } from '../controllers/brandController.js';

const router = Router();

router.post('/generate', generateBrandDNA);

export default router;
