import { Booking } from '../models/Booking.js';
import Family from '../models/Family.js';

const MAX_FAMILIES_PER_SLOT = 6;

export const bookingController = {
  createBooking: async (req, res) => {
    try {
      const { date, timeSlot } = req.body;

      if (!date || !timeSlot) {
        return res.status(400).json({ error: 'Date and time slot parameters are strictly required.' });
      }

      // 1. Verify that the user has filled out their family profile first
      const family = await Family.findOne({ userId: req.user.id });
      if (!family) {
        return res.status(400).json({ 
          error: 'Profile Core Missing: Please register your family details profile before attempting to schedule a slot.' 
        });
      }

      // 2. Enforce the government guideline ceiling (Strictly max 6 families per vector)
      const existingBookingsCount = await Booking.countDocuments({ date, timeSlot });
      if (existingBookingsCount >= MAX_FAMILIES_PER_SLOT) {
        return res.status(400).json({
          error: `Slot Capacity Attained: The ${timeSlot} distribution window on ${date} has reached its limit of ${MAX_FAMILIES_PER_SLOT} families.`
        });
      }

      // 3. Prevent a citizen from booking multiple slots for the same date cycle
      const alreadyBooked = await Booking.findOne({ userId: req.user.id, date });
      if (alreadyBooked) {
        return res.status(400).json({ 
          error: `Schedule Violation: You have already secured an allocation pickup slot (${alreadyBooked.timeSlot}) for ${date}.` 
        });
      }

      // 4. Record the final transaction manifest entry
      const booking = await Booking.create({
        userId: req.user.id,
        familyId: family._id,
        rationCardNumber: family.rationCardNumber,
        headOfFamily: family.headOfFamily,
        allocatedWeightKg: family.allocatedWeightKg,
        date,
        timeSlot
      });

      return res.status(201).json({
        success: true,
        message: 'Ration collection slot successfully locked down.',
        data: booking
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  getActiveBooking: async (req, res) => {
    try {
      // Fetch the most recent booking made by this authenticated user
      const booking = await Booking.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
      if (!booking) {
        return res.status(200).json({ success: true, data: null, message: 'No active scheduling entries found.' });
      }
      return res.status(200).json({ success: true, data: booking });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};