import { Router } from 'express';
import {
  getStartupProfile,
  createStartupProfile,
  updateStartupProfile,
  deleteStartupProfile,
} from '../controllers/startupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getStartupProfile)
  .post(createStartupProfile)
  .put(updateStartupProfile)
  .delete(deleteStartupProfile);

export default router;
