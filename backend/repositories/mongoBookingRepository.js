import Booking from '../models/Booking.js';

// Mongo-backed implementation of the booking repository. Reuses the single
// `Booking` model defined in models/Booking.js so there is exactly one schema
// (the previous inline schema collided with that model's name). This strategy
// is only active when DATA_SOURCE=MONGO; the default MOCK strategy is used
// everywhere today, so these methods are dormant but kept query-compatible.
export const mongoBookingRepository = {
  findFamilyById: async () => {
    // Family lookups are served from the in-memory seed set in MOCK mode.
    return null;
  },

  countBookingsInSlot: async (date, timeSlot) => {
    return Booking.countDocuments({ distributionDate: date, timeSlot });
  },

  createBooking: async (bookingData) => {
    const newBooking = new Booking(bookingData);
    return await newBooking.save();
  },

  getAllBookings: async () => {
    return Booking.find({});
  },

  createFamily: async () => {
    // Family creation is handled by the MOCK seed set today.
    return null;
  },
};
