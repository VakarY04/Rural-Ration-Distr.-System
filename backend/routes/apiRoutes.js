import express from 'express';
import { getFamilyProfile, updateFamilyProfile } from '../controllers/familyController.js';
import { createBooking, getUserBookings } from '../controllers/bookingController.js';
import { analyzeGrievance } from '../controllers/aiController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { register, login, sendOtp, verifyOtp, getMe, updateMe } from '../controllers/authController.js';

const router = express.Router();

// Auth Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.get('/auth/me', protect, getMe);
router.put('/auth/me', protect, updateMe);

// Profile & Booking Endpoints
router.get('/family/profile', protect, getFamilyProfile);
router.post('/family/profile', protect, updateFamilyProfile);
router.post('/bookings', protect, createBooking);
router.get('/bookings', protect, getUserBookings);

// Terminal Hub summary (profile status, quota, next booking, delivery route)
router.get('/dashboard/summary', protect, getDashboardSummary);

// Gemini AI Support Endpoint
router.post('/ai/grievance', protect, analyzeGrievance);

export default router;