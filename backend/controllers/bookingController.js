import Booking from '../models/Booking.js';

export const createBooking = async (req, res) => {
  try {
    const { rationCardNumber, headOfFamily, distributionDate, timeSlot, allocatedItems } = req.body;
    const booking = await Booking.create({
      user: req.user.id,
      rationCardNumber,
      headOfFamily,
      distributionDate,
      timeSlot,
      allocatedItems,
    });
    res.status(201).json({ message: 'Booking scheduled successfully!', booking });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to schedule booking.' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve booking records.' });
  }
};