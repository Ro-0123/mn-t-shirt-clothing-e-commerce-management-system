import express from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('staff', 'admin'), getAllSuppliers);
router.get('/:id', authenticate, authorize('staff', 'admin'), getSupplierById);
router.post('/', authenticate, authorize('staff', 'admin'), createSupplier);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateSupplier);
router.delete('/:id', authenticate, authorize('staff', 'admin'), deleteSupplier);

export default router;
