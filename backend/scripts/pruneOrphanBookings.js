// One-off cleanup: deletes Booking documents whose `user` points to a User
// that no longer exists (orphaned after an account was removed directly in
// MongoDB). Bookings created by the allocation engine have no `user` field
// and are always preserved.
//
//   npm run prune:bookings
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const run = async () => {
  await connectDB();
  console.log('[Prune] Connected to MongoDB');

  const allBookings = await Booking.find().lean();
  const userIds = [
    ...new Set(allBookings.map((b) => b.user).filter(Boolean).map((id) => id.toString())),
  ];
  const existingUsers = await User.find({ _id: { $in: userIds } }).select('_id').lean();
  const existingUserIds = new Set(existingUsers.map((u) => u._id.toString()));

  const orphanIds = allBookings
    .filter((b) => b.user && !existingUserIds.has(b.user.toString()))
    .map((b) => b._id);

  if (orphanIds.length === 0) {
    console.log('[Prune] No orphaned bookings found — nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  const result = await Booking.deleteMany({ _id: { $in: orphanIds } });
  console.log(`[Prune] Deleted ${result.deletedCount} orphaned booking(s).`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('[Prune] Failed:', error.message);
  process.exit(1);
});

