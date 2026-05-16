import { Router } from 'express';
import {
  createPlan,
  listPlans,
  getPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/', listPlans);
router.get('/:id', getPlan);
router.post('/', requireRole('superadmin'), createPlan);
router.patch('/:id', requireRole('superadmin'), updatePlan);
router.delete('/:id', requireRole('superadmin'), deletePlan);

export default router;
