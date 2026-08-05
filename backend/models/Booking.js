import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rationCardNumber: { type: String, required: true },
    headOfFamily: { type: String, required: true },
    distributionDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    allocatedItems: Array,
    status: { type: String, default: 'Confirmed' },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;