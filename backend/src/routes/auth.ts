import { Router } from 'express';
import {
  signup,
  login,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, changePassword);

export default router;
