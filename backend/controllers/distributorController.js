import Booking from '../models/Booking.js';
import {
  getDistributionSettings,
  DEFAULT_WAREHOUSE,
  DEFAULT_COLLECTION_CENTRE,
} from '../models/DistributionSettings.js';

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

// Aggregated snapshot powering the distributor console dashboard:
// headline stats (families booked etc.), recent booking queue, and the
// current editable delivery details + ration items configuration.
export const getDistributorSummary = async (req, res) => {
  try {
    const settings = await getDistributionSettings();

    const [recentBookings, bookedCards, totalBookings, confirmedBookings] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(30).lean(),
      Booking.distinct('rationCardNumber'),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Confirmed' }),
    ]);

    return res.status(200).json({
      name: req.user?.name || 'Staff',
      role: req.user?.role,
      stats: {
        familiesBooked: bookedCards.length,
        totalBookings,
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
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Distributor Summary Error:', error);
    return res.status(500).json({ message: 'Failed to load distributor summary.' });
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
    console.error('Update Delivery Details Error:', error);
    return res.status(500).json({ message: 'Failed to update delivery details.' });
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
    console.error('Update Ration Items Error:', error);
    return res.status(500).json({ message: 'Failed to update ration items.' });
  }
};

export default { getDistributorSummary, updateDeliveryDetails, updateRationItems };
