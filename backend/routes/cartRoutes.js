import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.put('/', authenticate, updateCartItem);
router.delete('/clear', authenticate, clearCart);
router.delete('/', authenticate, removeCartItem);

export default router;
