import express from 'express';
import { bookingController } from '../controllers/bookingController.js';

const router = express.Router();

// Route: Citizen submits a slot selection mapping to a unique identity token
router.post('/', bookingController.createBooking);

// Route: Citizen records profile demographics data arrays
router.post('/register-family', bookingController.registerFamily);

// Route: Distributor fetches calculated cargo logistics manifest sheets
router.get('/manifest', bookingController.getManifest);

export default router;