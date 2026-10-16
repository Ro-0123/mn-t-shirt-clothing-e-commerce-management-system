import express from 'express';
import { getStoreInfo, updateStoreInfo } from '../controllers/storeInfoController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getStoreInfo);
router.put('/', authenticate, authorize('admin'), updateStoreInfo);

export default router;
