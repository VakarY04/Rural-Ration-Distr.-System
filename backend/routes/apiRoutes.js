import express from 'express';
import { register, login, sendOtp, verifyOtp } from '../controllers/authController.js';
import { getFamilyProfile, updateFamilyProfile } from '../controllers/familyController.js';
import { createBooking, getUserBookings } from '../controllers/bookingController.js';
import { analyzeGrievance } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);

// Profile & Booking Endpoints
router.get('/family/profile', protect, getFamilyProfile);
router.post('/family/profile', protect, updateFamilyProfile);
router.post('/bookings', protect, createBooking);
router.get('/bookings', protect, getUserBookings);

// Gemini AI Support Endpoint
router.post('/ai/grievance', protect, analyzeGrievance);

export default router;