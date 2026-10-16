import express from 'express';
import {
  requestPayment,
  confirmPayment,
  getPaymentByOrder,
  generateKhqrCode,
  checkKhqrStatus,
  checkKhqrStatusByMd5,
  createPaywayPayment,
  checkPaywayStatusByTranId,
  paywayCallback,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/khqr', authenticate, generateKhqrCode);
router.get('/khqr/check/:orderId', authenticate, checkKhqrStatus);
router.get('/khqr/check-md5/:md5', authenticate, checkKhqrStatusByMd5);
router.post('/payway/create', authenticate, createPaywayPayment);
router.get('/payway/check/:tranId', authenticate, checkPaywayStatusByTranId);
router.post('/payway/callback', paywayCallback);
router.post('/request', authenticate, requestPayment);
router.get('/order/:orderId', authenticate, getPaymentByOrder);
router.put('/:id/confirm', authenticate, authorize('staff', 'admin'), confirmPayment);

export default router;
