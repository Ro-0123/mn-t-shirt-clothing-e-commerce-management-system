import express from 'express';
import {
  createOrder,
  checkOrderStock,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.post('/check-stock', authenticate, checkOrderStock);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('staff', 'admin'), updateOrderStatus);
router.put('/:id/cancel', authenticate, cancelOrder);

export default router;
