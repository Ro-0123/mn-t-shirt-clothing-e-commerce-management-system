import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize('staff', 'admin'), createCategory);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateCategory);
router.delete('/:id', authenticate, authorize('staff', 'admin'), deleteCategory);

export default router;
