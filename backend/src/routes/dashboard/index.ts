import { Router } from 'express';
import { getDashboardSummary, getMyDashboardSummary } from '../../controllers/dashboard/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', requireRole('superadmin', 'admin'), getDashboardSummary);
router.get('/my-summary', getMyDashboardSummary);

export default router;
