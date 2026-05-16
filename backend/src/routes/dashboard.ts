import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', requireRole('superadmin', 'admin'), getDashboardSummary);

export default router;
