import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadProductImages as uploadProductImagesMiddleware } from '../middleware/uploadProductImages.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post(
  '/upload-images',
  authenticate,
  authorize('staff', 'admin'),
  uploadProductImagesMiddleware.array('images', 10),
  uploadProductImages
);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('staff', 'admin'), createProduct);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateProduct);
router.delete('/:id', authenticate, authorize('staff', 'admin'), deleteProduct);

export default router;
