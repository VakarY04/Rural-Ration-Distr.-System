import Booking from '../models/Booking.js';
import { getDistributionSettings, DEFAULT_SLOTS } from '../models/DistributionSettings.js';
import { sendError } from '../utils/httpError.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const publicSlots = (settings) =>
  (Array.isArray(settings.slots) && settings.slots.length ? settings.slots : DEFAULT_SLOTS).map((s) => ({
    key: s.key,
    label: s.label,
    capacity: s.capacity,
    isOpen: s.isOpen !== false,
  }));

// GET /slots — every authenticated user (citizens book from it, staff manage it).
export const getSlots = async (req, res) => {
  try {
    const settings = await getDistributionSettings();
    return res.status(200).json({ slots: publicSlots(settings) });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load slot windows.',
      logLabel: 'Get Slots Error:',
    });
  }
};

// GET /slots/availability?date=YYYY-MM-DD — per-window live occupancy so the
// citizen form can disable Full/Closed windows before submitting.
export const getSlotAvailability = async (req, res) => {
  try {
    const { date } = req.query || {};
    if (!date || !DATE_RE.test(date)) {
      return res.status(400).json({ message: 'A valid date (YYYY-MM-DD) is required.', code: 'INVALID_DATE' });
    }
    const settings = await getDistributionSettings();
    const slots = publicSlots(settings);

    const counts = await Booking.aggregate([
      { $match: { distributionDate: date, status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$timeSlot', booked: { $sum: 1 } } },
    ]);
    const bookedBySlot = new Map(counts.map((c) => [c._id, c.booked]));

    return res.status(200).json({
      date,
      slots: slots.map((s) => {
        const booked = bookedBySlot.get(s.label) || 0;
        const remaining = Math.max(s.capacity - booked, 0);
        return { ...s, booked, remaining, isFull: remaining <= 0 };
      }),
    });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load slot availability.',
      logLabel: 'Slot Availability Error:',
    });
  }
};

const cleanLabel = (value, max = 40) => String(value ?? '').trim().slice(0, max);

// PUT /slots — admin only (7.1 matrix). Replaces the whole template list:
// create windows (add rows), set per-slot caps, close bookings (isOpen false).
export const updateSlots = async (req, res) => {
  try {
    const raw = Array.isArray(req.body?.slots) ? req.body.slots : [];
    if (raw.length === 0) {
      return res.status(400).json({ message: 'At least one slot window is required.' });
    }
    if (raw.length > 8) {
      return res.status(400).json({ message: 'A maximum of 8 slot windows is allowed.' });
    }

    const slots = raw.map((row, index) => ({
      key: `slot-${index + 1}`,
      label: cleanLabel(row?.label),
      capacity: Math.trunc(Number(row?.capacity)),
      isOpen: row?.isOpen !== false,
    }));

    if (slots.some((s) => !s.label)) {
      return res.status(400).json({ message: 'Every slot window needs a label (e.g. 09:00 AM - 11:00 AM).' });
    }
    if (slots.some((s) => !Number.isFinite(s.capacity) || s.capacity < 1 || s.capacity > 100)) {
      return res.status(400).json({ message: 'Every slot capacity must be between 1 and 100 families.' });
    }
    const seen = new Set(slots.map((s) => s.label.toLowerCase()));
    if (seen.size !== slots.length) {
      return res.status(400).json({ message: 'Slot window labels must be unique.' });
    }

    const settings = await getDistributionSettings();
    settings.slots = slots;
    await settings.save();

    return res.status(200).json({ message: 'Slot windows updated.', slots: publicSlots(settings) });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to update slot windows.',
      logLabel: 'Update Slots Error:',
    });
  }
};
