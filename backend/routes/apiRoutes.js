import express from 'express';
import * as authController from '../controllers/authController.js';
import { familyController } from '../controllers/familyController.js';
import { bookingController } from '../controllers/bookingController.js';
import { aiController } from '../controllers/aiController.js'; // IMPORT NEW CONTROLLER
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
// Authentication and Security Recovery Endpoints
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password/:token', authController.resetPassword);

// --- OTP AUTHENTICATION ENDPOINTS ---
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);

// Protected Family Storage Endpoints
router.post('/family/profile', protect, familyController.saveProfile);
router.get('/family/profile', protect, familyController.getProfile);

// Protected Slot Scheduling Endpoints
router.post('/bookings', protect, bookingController.createBooking);
router.get('/bookings/active', protect, bookingController.getActiveBooking);

// Protected Gemini AI Processing Engine Endpoint
router.post('/ai/grievance', protect, aiController.processGrievance);

export default router;