import { Router } from 'express';
import {
  createBooking,
  listBookings,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

router.get('/', listBookings);
router.post('/', createBooking);
router.patch('/:id/status', requireRole('superadmin', 'admin'), updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
