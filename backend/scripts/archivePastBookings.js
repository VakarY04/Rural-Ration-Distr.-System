// Manual run of the Phase 5.5 archival job:
// moves past Confirmed bookings to Archived.
//
//   npm run archive:bookings
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { archivePastBookings } from '../services/archivalService.js';

dotenv.config();

const run = async () => {
  await connectDB();
  console.log('[Archive] Connected to MongoDB');
  const count = await archivePastBookings();
  console.log(`[Archive] Archived ${count} past booking(s).`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('[Archive] Failed:', error.message);
  process.exit(1);
});
