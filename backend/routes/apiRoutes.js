import express from 'express';
import { authController } from '../controllers/authController.js';
import { familyController } from '../controllers/familyController.js';
import { bookingController } from '../controllers/bookingController.js';
import { aiController } from '../controllers/aiController.js'; // IMPORT NEW CONTROLLER
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.put('/auth/reset-password/:token', authController.resetPassword);

// Protected Family Storage Endpoints
router.post('/family/profile', protect, familyController.saveProfile);
router.get('/family/profile', protect, familyController.getProfile);

// Protected Slot Scheduling Endpoints
router.post('/bookings', protect, bookingController.createBooking);
router.get('/bookings/active', protect, bookingController.getActiveBooking);

// Protected Gemini AI Processing Engine Endpoint
router.post('/ai/grievance', protect, aiController.processGrievance);

export default router;