import express from 'express';
import { register, login, logout, profile, updateProfile, updateAvatar } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticate, profile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/avatar', authenticate, uploadAvatar.single('avatar'), updateAvatar);

export default router;
