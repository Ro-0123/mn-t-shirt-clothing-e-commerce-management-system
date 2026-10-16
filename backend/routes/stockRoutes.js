import express from 'express';
import {
  getAllStocks,
  getStockByProductId,
  updateStock,
  getLowStockItems,
} from '../controllers/stockController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('staff', 'admin'), getAllStocks);
router.get('/low', authenticate, authorize('staff', 'admin'), getLowStockItems);
router.get('/product/:productId', authenticate, authorize('staff', 'admin'), getStockByProductId);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateStock);

export default router;
