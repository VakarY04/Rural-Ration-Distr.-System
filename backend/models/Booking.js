import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rationCardNumber: { type: String, required: true },
    headOfFamily: { type: String, required: true },
    distributionDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    allocatedItems: Array,
    status: { type: String, default: 'Confirmed', enum: ['Confirmed', 'Cancelled', 'Collected', 'Archived'] },
  },
  { timestamps: true }
);

// Phase 5.1 + 5.2 — DB-level guards (never trust the client alone).
// One active booking per user per date, and per ration card per date, so a
// double-click, replay, or second account on the same card cannot create two
// ledger entries. Slot-capacity (count per date+slot) is enforced in the
// controller against the admin-managed DistributionSettings.slots template
// (7.2); the index below keeps that count query fast.
bookingSchema.index({ user: 1, distributionDate: 1 }, { unique: true });
bookingSchema.index({ rationCardNumber: 1, distributionDate: 1 }, { unique: true });
bookingSchema.index({ distributionDate: 1, timeSlot: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;