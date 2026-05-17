import { Router } from 'express';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
} from '../../controllers/event/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', requireRole('superadmin', 'admin'), createEvent);
router.patch('/:id', requireRole('superadmin', 'admin'), updateEvent);
router.delete('/:id', requireRole('superadmin', 'admin'), deleteEvent);
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);

export default router;
