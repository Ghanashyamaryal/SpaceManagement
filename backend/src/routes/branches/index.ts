import { Router } from 'express';
import {
  createBranch,
  listBranches,
  getBranch,
  updateBranch,
  deleteBranch,
} from '../../controllers/branch/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/', listBranches);
router.get('/:id', getBranch);
router.post('/', requireRole('superadmin'), createBranch);
router.patch('/:id', requireRole('superadmin', 'admin'), updateBranch);
router.delete('/:id', requireRole('superadmin'), deleteBranch);

export default router;
