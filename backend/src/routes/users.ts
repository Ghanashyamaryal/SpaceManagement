import { Router } from 'express';
import {
  createUser,
  listUsers,
  listMembers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('superadmin', 'admin'), listUsers);
router.get('/members', requireRole('superadmin', 'admin'), listMembers);
router.post('/', requireRole('superadmin', 'admin'), createUser);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteUser);

export default router;
