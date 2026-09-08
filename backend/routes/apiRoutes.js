import express from 'express';
import { getFamilyProfile, updateFamilyProfile } from '../controllers/familyController.js';
import { createBooking, getUserBookings } from '../controllers/bookingController.js';
import { analyzeGrievance } from '../controllers/aiController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import {
  getDistributorSummary,
  updateDeliveryDetails,
  updateRationItems,
} from '../controllers/distributorController.js';
import { requireStaff } from '../middleware/staffMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { dbGate } from '../middleware/dbGate.js';
import { register, login, sendOtp, verifyOtp, getMe, updateMe, deleteMe } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { submitFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// Every endpoint below needs MongoDB; answer 503 immediately while it is
// reconnecting instead of buffering queries into timeouts.
router.use(dbGate);

// Auth Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password/:token', resetPassword);
router.get('/auth/me', protect, getMe);
router.put('/auth/me', protect, updateMe);
router.delete('/auth/me', protect, deleteMe);

// Profile & Booking Endpoints
router.get('/family/profile', protect, getFamilyProfile);
router.post('/family/profile', protect, updateFamilyProfile);
router.post('/bookings', protect, createBooking);
router.get('/bookings', protect, getUserBookings);

// Terminal Hub summary (profile status, quota, next booking, delivery route)
router.get('/dashboard/summary', protect, getDashboardSummary);

// Distributor / Admin console (staff only)
router.get('/distributor/summary', protect, requireStaff, getDistributorSummary);
router.put('/distributor/delivery', protect, requireStaff, updateDeliveryDetails);
router.put('/distributor/items', protect, requireStaff, updateRationItems);

// Citizen feedback inbox (stored always, emailed to owner when SMTP is set)
router.post('/feedback', protect, submitFeedback);

// Gemini AI Support Endpoint
router.post('/ai/grievance', protect, analyzeGrievance);

export default router;