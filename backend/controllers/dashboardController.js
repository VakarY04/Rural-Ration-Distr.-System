import User from '../models/User.js';
import Family from '../models/Family.js';
import Booking from '../models/Booking.js';
import { computeRationBreakdown } from '../services/rationCalculator.js';

// Placeholder depot + delivery-route data. Until the distributor/admin
// module is built (planned for later), these are fixed defaults rather than
// values an admin has entered — this is what the Terminal Hub map and
// "Ration Delivery Details" panel display in the meantime.
const DEFAULT_DEPOT = {
  label: 'Sector 12 Government Ration Depot',
  address: 'Sector 12, Greater Noida, Uttar Pradesh',
  lat: 28.4744,
  lng: 77.5040,
};

// Get an aggregated snapshot for the Terminal Hub (dashboard home) page:
// citizen name, household profile status, next booking, computed ration
// quota, and delivery route endpoints for the map.
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access token.' });
    }

    const [user, profile, latestBooking] = await Promise.all([
      User.findById(userId),
      Family.findOne({ user: userId }),
      Booking.findOne({ user: userId }).sort({ createdAt: -1 }),
    ]);

    // members[] holds dependents only, so the head of family adds one more.
    const totalMembers = profile ? (profile.members?.length || 0) + 1 : 0;
    const ration = computeRationBreakdown(totalMembers);

    const deliveryTo = profile?.address?   
    {
      label: `${profile.headOfFamily}'s residence`,
      address: `${profile.address.village}, ${profile.address.block ? profile.address.block + ', ' : ''}${profile.address.district}, ${profile.address.state}`,
      lat: 28.4595,
      lng: 77.5040,
    }:
    {
      label: 'Registered residence',
      address: 'Add your address on the Family Profile page',
      lat: 28.4595,
      lng: 77.5040,
    };

    return res.status(200).json({
      name: user?.name || 'Citizen',
      profile: profile
        ? {
            rationCardNumber: profile.rationCardNumber,
            headOfFamily: profile.headOfFamily,
            dependentCount: profile.members?.length || 0,
            totalMembers,
          }
        : null,
      booking: latestBooking
        ? {
            distributionDate: latestBooking.distributionDate,
            timeSlot: latestBooking.timeSlot,
            status: latestBooking.status,
          }
        : null,
      ration,
      delivery: {
        from: DEFAULT_DEPOT,
        to: deliveryTo,
      },
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    return res.status(500).json({ message: 'Failed to load terminal hub summary.' });
  }
};

export default { getDashboardSummary };
