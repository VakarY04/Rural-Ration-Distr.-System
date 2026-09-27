import express from 'express';
import { getFamilyProfile, updateFamilyProfile } from '../controllers/familyController.js';
import { createBooking, getActiveBooking, getUserBookings, setBookingCollectionStatus } from '../controllers/bookingController.js';
import { analyzeGrievance } from '../controllers/aiController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import {
  getDistributorSummary,
  getStaffFamilyDetails,
  updateDeliveryDetails,
  updateRationItems,
} from '../controllers/distributorController.js';
import { getSlots, getSlotAvailability, updateSlots } from '../controllers/slotController.js';
import {
  fileGrievance,
  getMyGrievances,
  getGrievanceQueue,
  updateGrievance,
} from '../controllers/grievanceController.js';
import { getReports, exportReports } from '../controllers/reportController.js';
import { requireStaff, requireAdmin } from '../middleware/staffMiddleware.js';
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
router.get('/bookings/active', protect, getActiveBooking);
router.get('/bookings', protect, getUserBookings);

// Terminal Hub summary (profile status, quota, next booking, delivery route)
router.get('/dashboard/summary', protect, getDashboardSummary);

// Distributor / Admin console (staff only)
// Reads stay staff-wide; global-config writes are admin-only per the 7.1
// roles matrix (distributors are read-only until per-shop scoping lands).
router.get('/distributor/summary', protect, requireStaff, getDistributorSummary);
// "Family has taken the ration" action + unmark — distributor-only writes;
// admins see the resulting status read-only and are rejected here.
router.patch('/distributor/bookings/:id', protect, requireStaff, setBookingCollectionStatus);
// Household record for the Families Details "View" action — staff-wide so
// both admins and distributors see members + ration entitlement.
router.get('/distributor/families/:rationCardNumber', protect, requireStaff, getStaffFamilyDetails);
router.put('/distributor/delivery', protect, requireAdmin, updateDeliveryDetails);
router.put('/distributor/items', protect, requireAdmin, updateRationItems);

// Slot windows (7.2) — reads for every signed-in user (citizens book from
// them); writes are admin-only. Availability counts live bookings per window.
router.get('/slots', protect, getSlots);
router.get('/slots/availability', protect, getSlotAvailability);
router.put('/slots', protect, requireAdmin, updateSlots);

// Grievance queue (7.3) — filing + citizen tracking for everyone signed in;
// the full queue + assign/track/resolve for staff. Resolving notifies the
// citizen in-app (resolution field) and by email when SMTP is configured.
router.post('/grievances', protect, fileGrievance);
router.get('/grievances/mine', protect, getMyGrievances);
router.get('/grievances', protect, requireStaff, getGrievanceQueue);
router.patch('/grievances/:id', protect, requireStaff, updateGrievance);

// Reports (7.4) — entitlement vs allocation vs collection per district.
// Staff only; JSON for the console panel + CSV for download.
router.get('/reports', protect, requireStaff, getReports);
router.get('/reports/export', protect, requireStaff, exportReports);

// Citizen feedback inbox (stored always, emailed to owner when SMTP is set)
router.post('/feedback', protect, submitFeedback);

// Gemini AI Support Endpoint
router.post('/ai/grievance', protect, analyzeGrievance);

export default router;