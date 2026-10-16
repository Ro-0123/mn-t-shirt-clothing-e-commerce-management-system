import express from 'express';
import {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
} from '../controllers/deliveryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('staff', 'admin'), getAllDeliveries);
router.get('/:id', authenticate, authorize('staff', 'admin'), getDeliveryById);
router.post('/', authenticate, authorize('staff', 'admin'), createDelivery);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateDelivery);

export default router;
