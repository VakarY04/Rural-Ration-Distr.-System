import express from 'express';

// Import Auth Controllers directly
import { 
  register, 
  login, 
  sendOtp, 
  verifyOtp 
} from '../controllers/authController.js';

// Import Family Controllers directly
import { 
  getFamilyProfile, 
  updateFamilyProfile 
} from '../controllers/familyController.js';

// Import Auth Middleware
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// 🔑 AUTHENTICATION ENDPOINTS
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);

// ==========================================
// 🏠 FAMILY PROFILE ENDPOINTS (PROTECTED)
// ==========================================
router.get('/family/profile', protect, getFamilyProfile);
router.post('/family/profile', protect, updateFamilyProfile);

export default router;