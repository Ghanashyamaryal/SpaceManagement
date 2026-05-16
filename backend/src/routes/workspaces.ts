import { Router } from 'express';
import {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from '../controllers/workspaceController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/', listWorkspaces);
router.get('/:id', getWorkspace);
router.post('/', requireRole('superadmin', 'admin'), createWorkspace);
router.patch('/:id', requireRole('superadmin', 'admin'), updateWorkspace);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteWorkspace);

export default router;
