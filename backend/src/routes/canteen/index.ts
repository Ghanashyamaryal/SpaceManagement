import { Router } from 'express';
import {
  createMenuItem,
  listMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getMyBalance,
  listUserBalances,
  getUserBalance,
  settleBalance,
} from '../../controllers/canteen/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);

// Menu
router.get('/menu', listMenuItems);
router.get('/menu/:id', getMenuItem);
router.post('/menu', requireRole('superadmin', 'admin'), createMenuItem);
router.patch('/menu/:id', requireRole('superadmin', 'admin'), updateMenuItem);
router.delete('/menu/:id', requireRole('superadmin', 'admin'), deleteMenuItem);

// Orders
router.get('/orders', listOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', requireRole('superadmin', 'admin'), updateOrderStatus);
router.delete('/orders/:id', cancelOrder);

// Credit
router.get('/credit/me', getMyBalance);
router.get('/credit/users', requireRole('superadmin', 'admin'), listUserBalances);
router.get('/credit/users/:id', requireRole('superadmin', 'admin'), getUserBalance);
router.post('/credit/settle', requireRole('superadmin', 'admin'), settleBalance);

export default router;
