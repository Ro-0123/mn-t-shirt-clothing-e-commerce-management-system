import express from 'express';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  requestReport,
  getReports,
  getReportById,
  getAnalytics,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', authenticate, authorize('staff', 'admin'), getAnalytics);
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.post('/users', authenticate, authorize('admin'), createUser);
router.get('/users/:id', authenticate, authorize('admin'), getUserById);
router.put('/users/:id', authenticate, authorize('admin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
router.post('/reports', authenticate, authorize('admin'), requestReport);
router.get('/reports', authenticate, authorize('admin'), getReports);
router.get('/reports/:id', authenticate, authorize('admin'), getReportById);

export default router;
