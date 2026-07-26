import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  rationCardNumber: { type: String, required: true },
  headOfFamily: { type: String, required: true },
  allocatedWeightKg: { type: Number, required: true },
  date: { type: String, required: true },       // Stored as YYYY-MM-DD
  timeSlot: { type: String, required: true }    // e.g., "09:00 AM"
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);