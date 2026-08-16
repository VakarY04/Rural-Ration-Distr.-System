import express from 'express';
import { createBooking, getUserBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: Citizen submits a slot selection mapping to a unique identity token
router.post('/', protect, createBooking);

// Route: Citizen views their own bookings
router.get('/', protect, getUserBookings);

// TODO (distributor side, later):
// router.post('/register-family', registerFamily);
// router.get('/manifest', getManifest);

export default router;