import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getWishlist,
  toggleWishlist,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;
