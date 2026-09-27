import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Family from '../models/Family.js';
import Grievance from '../models/Grievance.js';
import { computeRationBreakdown } from '../services/rationCalculator.js';
import {
  getDistributionSettings,
  DEFAULT_WAREHOUSE,
  DEFAULT_COLLECTION_CENTRE,
  DEFAULT_SLOTS,
} from '../models/DistributionSettings.js';
import { permissionsFor } from '../middleware/staffMiddleware.js';
import { sendError } from '../utils/httpError.js';

// Pulls the numeric kg out of an allocatedItems entry like "35 kg".
const parseKg = (value) => {
  const n = parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const sumAllocatedKg = (bookings) =>
  bookings.reduce((sum, b) => sum + (b.allocatedItems || []).reduce((s, i) => s + parseKg(i?.quantity), 0), 0);

const publicBooking = (b) => ({
  id: b._id,
  headOfFamily: b.headOfFamily,
  rationCardNumber: b.rationCardNumber,
  distributionDate: b.distributionDate,
  timeSlot: b.timeSlot,
  status: b.status,
  allocatedItems: b.allocatedItems || [],
});

// Staff family details (admin + distributor) — household record as entered in
// the citizen's Family Profile (members with name/age/relation + address) plus
// the computed ration entitlement for that household (same PDS rule as the
// Terminal Hub: max(35, 10 x members) kg) and the latest booking, if any.
export const getStaffFamilyDetails = async (req, res) => {
  try {
    const rationCardNumber = String(req.params?.rationCardNumber ?? '').trim();
    if (!rationCardNumber) {
      return res.status(400).json({ message: 'A ration card number is required.' });
    }

    const family = await Family.findOne({ rationCardNumber }).sort({ updatedAt: -1 }).lean();
    if (!family) {
      return res.status(404).json({
        message: 'No household profile found for this ration card. The citizen may not have completed their Family Profile yet.',
      });
    }

    const members = Array.isArray(family.members) ? family.members : [];
    const totalMembers = members.length ? members.length : 1;
    const ration = computeRationBreakdown(totalMembers);

    const latestBooking = await Booking.findOne({ rationCardNumber })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      rationCardNumber: family.rationCardNumber,
      headOfFamily: family.headOfFamily,
      address: family.address || null,
      members: members.map((m) => ({
        name: m?.name || 'Member',
        age: Number(m?.age) || 0,
        relation: m?.relation || 'Dependent',
      })),
      totalMembers,
      ration: {
        totalKg: ration.totalKg,
        totalMembers: ration.totalMembers,
        items: ration.items,
      },
      booking: latestBooking ? publicBooking(latestBooking) : null,
      updatedAt: family.updatedAt || null,
    });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load family details.',
      logLabel: 'Staff Family Details Error:',
    });
  }
};

// Aggregated snapshot powering the distributor console dashboard:
// headline stats (families booked etc.), recent booking queue, and the
// current editable delivery details + ration items + slot windows.
export const getDistributorSummary = async (req, res) => {
  try {
    const settings = await getDistributionSettings();

    // Load every booking and drop any whose owning account no longer exists
    // (e.g. a User was deleted straight from MongoDB). Bookings created by the
    // allocation engine carry no `user` field, so those are always retained.
    const allBookings = await Booking.find().lean();
    const userIds = [
      ...new Set(allBookings.map((b) => b.user).filter(Boolean).map((id) => id.toString())),
    ];
    const existingUsers = userIds.length
      ? await User.find({ _id: { $in: userIds } }).select('_id').lean()
      : [];
    const existingUserIds = new Set(existingUsers.map((u) => u._id.toString()));
    const bookings = allBookings.filter(
      (b) => !b.user || existingUserIds.has(b.user.toString())
    );

    const recentBookings = [...bookings]
      // Phase 5.5 — Archived slots leave the live queue (GIGW Q8); they
      // remain in history via stats, never as actionable rows.
      .filter((b) => b.status !== 'Archived')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);

    const bookedCards = [
      ...new Set(bookings.map((b) => b.rationCardNumber).filter(Boolean)),
    ];
    const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed').length;

    // 7.3 — grievance headline counts for the console (failure-isolated: a
    // grievance-collection hiccup must never break the whole summary).
    let grievanceStats = { Open: 0, 'In Review': 0, Resolved: 0, total: 0 };
    try {
      const counts = await Grievance.aggregate([
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ]);
      for (const c of counts) {
        if (grievanceStats[c._id] !== undefined) grievanceStats[c._id] = c.n;
        grievanceStats.total += c.n;
      }
    } catch {
      grievanceStats = { Open: 0, 'In Review': 0, Resolved: 0, total: 0 };
    }

    return res.status(200).json({
      name: req.user?.name || 'Staff',
      role: req.user?.role,
      shopId: req.user?.shopId || null,
      avatar: req.user?.avatar || null,
      phone: req.user?.phone || null,
      email: req.user?.email || null,
      address: req.user?.address
        ? {
            village: req.user.address.village || '',
            block: req.user.address.block || '',
            district: req.user.address.district || '',
            state: req.user.address.state || '',
            pincode: req.user.address.pincode || '',
          }
        : { village: '', block: '', district: '', state: '', pincode: '' },
      permissions: permissionsFor(req.user?.role),
      stats: {
        familiesBooked: bookedCards.length,
        totalBookings: bookings.length,
        confirmedBookings,
        grainCommittedKg: Math.round(sumAllocatedKg(recentBookings)),
      },
      bookings: recentBookings.map(publicBooking),
      // Coordinates are infrastructure defaults (admin edits only touch
      // labels/addresses), so the console route map always has valid pins.
      delivery: {
        from: { ...settings.delivery.from, lat: DEFAULT_WAREHOUSE.lat, lng: DEFAULT_WAREHOUSE.lng },
        to: { ...settings.delivery.to, lat: DEFAULT_COLLECTION_CENTRE.lat, lng: DEFAULT_COLLECTION_CENTRE.lng },
      },
      items: settings.items,
      slots: Array.isArray(settings.slots) && settings.slots.length ? settings.slots : DEFAULT_SLOTS,
      distributionDate: settings.distributionDate || '',
      grievanceStats,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load distributor summary.',
      logLabel: 'Distributor Summary Error:',
    });
  }
};

const cleanText = (value, max = 160) => String(value ?? '').trim().slice(0, max);

// Admin edit #1 — "Ration Delivery Details" (warehouse → collection centre).
export const updateDeliveryDetails = async (req, res) => {
  try {
    const { from, to } = req.body || {};
    const fromLabel = cleanText(from?.label);
    const fromAddress = cleanText(from?.address);
    const toLabel = cleanText(to?.label);
    const toAddress = cleanText(to?.address);

    if (!fromLabel || !fromAddress || !toLabel || !toAddress) {
      return res.status(400).json({ message: 'Both origin and destination need a label and address.' });
    }

    const settings = await getDistributionSettings();
    settings.delivery = { from: { label: fromLabel, address: fromAddress }, to: { label: toLabel, address: toAddress } };
    await settings.save();

    return res.status(200).json({ message: 'Delivery details updated.', delivery: settings.delivery });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to update delivery details.',
      logLabel: 'Update Delivery Details Error:',
    });
  }
};

// Admin edit #2 — "Ration Items & Quantity" shown on citizen hubs.
export const updateRationItems = async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    if (rawItems.length === 0) {
      return res.status(400).json({ message: 'At least one ration item is required.' });
    }

    const items = rawItems.slice(0, 12).map((item, index) => ({
      key: `item-${index + 1}`,
      label: cleanText(item?.label, 80),
      quantity: Math.max(Number(item?.quantity) || 0, 0),
      unit: cleanText(item?.unit, 10) || 'kg',
    }));

    if (items.some((i) => !i.label)) {
      return res.status(400).json({ message: 'Every ration item needs a name.' });
    }

    const settings = await getDistributionSettings();
    settings.items = items;
    await settings.save();

    return res.status(200).json({ message: 'Ration items updated.', items: settings.items });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to update ration items.',
      logLabel: 'Update Ration Items Error:',
    });
  }
};
