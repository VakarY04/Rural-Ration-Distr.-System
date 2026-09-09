import Booking from '../models/Booking.js';
import { getRequestUserId } from '../utils/requestUser.js';
import { sendError } from '../utils/httpError.js';
import { MAX_FAMILIES_PER_SLOT } from '../services/allocationService.js';

// Phase 5.1 + 5.2 — server-side guards. The client has matching checks, but
// curl/Postman bypass them, so every rule is re-enforced here.
// Distributor side is incomplete: per-slot editable caps (Phase 7.2) do not
// exist yet, so a single default cap (MAX_FAMILIES_PER_SLOT) applies to all
// windows. Unique indexes in models/Booking.js backstop the duplicate checks
// against concurrent requests.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const todayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

export const createBooking = async (req, res) => {
  try {
    const user = getRequestUserId(req);
    const { rationCardNumber, headOfFamily, distributionDate, timeSlot, allocatedItems } = req.body;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized.', code: 'UNAUTHORIZED' });
    }
    if (!rationCardNumber || !headOfFamily || !distributionDate || !timeSlot) {
      return res.status(400).json({ message: 'Ration card, head of family, date and time slot are required.', code: 'MISSING_FIELDS' });
    }
    if (!DATE_RE.test(distributionDate)) {
      return res.status(400).json({ message: 'Distribution date must be YYYY-MM-DD.', code: 'INVALID_DATE' });
    }
    if (distributionDate < todayIST()) {
      return res.status(400).json({ message: 'Distribution date cannot be in the past.', code: 'PAST_DATE' });
    }

    // 5.2 duplicate-household: one booking per user per date, and per card
    // per date (covers a second login reusing the same ration card).
    const duplicate = await Booking.findOne({
      $or: [{ user, distributionDate }, { rationCardNumber, distributionDate }],
    }).lean();
    if (duplicate) {
      return res.status(409).json({ message: 'A booking already exists for this household on the selected date.', code: 'ALREADY_BOOKED' });
    }

    // 5.1 slot-capacity guard.
    const occupancy = await Booking.countDocuments({
      distributionDate,
      timeSlot,
      status: { $ne: 'Cancelled' },
    });
    if (occupancy >= MAX_FAMILIES_PER_SLOT) {
      return res.status(409).json({ message: `The ${timeSlot} window on ${distributionDate} is full. Please choose another slot.`, code: 'SLOT_FULL' });
    }

    const booking = await Booking.create({
      user,
      rationCardNumber,
      headOfFamily,
      distributionDate,
      timeSlot,
      allocatedItems,
    });
    res.status(201).json({ message: 'Booking scheduled successfully!', booking });
  } catch (error) {
    // Unique-index backstop for concurrent duplicate POSTs.
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'A booking already exists for this household on the selected date.', code: 'ALREADY_BOOKED' });
    }
    return sendError(res, error, { status: 400 });
  }
};

export const getActiveBooking = async (req, res) => {
  try {
    const user = getRequestUserId(req);
    const booking = await Booking.findOne({
      user,
      distributionDate: { $gte: todayIST() },
      status: { $ne: 'Cancelled' },
    }).sort({ distributionDate: 1, createdAt: -1 });
    res.status(200).json({ booking: booking || null });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to retrieve active booking.',
      logLabel: 'Get Active Booking Error:',
    });
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
