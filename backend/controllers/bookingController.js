import Booking from '../models/Booking.js';
import { getRequestUserId } from '../utils/requestUser.js';
import { sendError } from '../utils/httpError.js';

export const createBooking = async (req, res) => {
  try {
    const { rationCardNumber, headOfFamily, distributionDate, timeSlot, allocatedItems } = req.body;
    const booking = await Booking.create({
      user: getRequestUserId(req),
      rationCardNumber,
      headOfFamily,
      distributionDate,
      timeSlot,
      allocatedItems,
    });
    res.status(201).json({ message: 'Booking scheduled successfully!', booking });
  } catch (error) {
    return sendError(res, error, { status: 400 });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: getRequestUserId(req) }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to retrieve booking records.',
      logLabel: 'Get User Bookings Error:',
    });
  }
};
