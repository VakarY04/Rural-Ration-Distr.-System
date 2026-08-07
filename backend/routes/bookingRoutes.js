import express from 'express';
import { createBooking, getUserBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

// NOTE: This router is not currently mounted in server.js (apiRoutes.js handles
// the live '/api/bookings' endpoints instead). Kept here for the distributor-side
// work planned later.
const router = express.Router();

// Route: Citizen submits a slot selection mapping to a unique identity token
router.post('/', protect, createBooking);

// Route: Citizen views their own bookings
router.get('/', protect, getUserBookings);

// TODO (distributor side, later):
// router.post('/register-family', registerFamily);
// router.get('/manifest', getManifest);

export default router;