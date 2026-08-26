import User from '../models/User.js';
import Family from '../models/Family.js';
import Booking from '../models/Booking.js';
import { computeRationBreakdown } from '../services/rationCalculator.js';
import { findDistributorForDistrict } from '../data/distributors.js';
import { getDistributionSettings, DEFAULT_WAREHOUSE } from '../models/DistributionSettings.js';

// Placeholder depot + delivery-route data. Until the distributor/admin
// module is built (planned for later), these are fixed defaults rather than
// values an admin has entered — this is what the Terminal Hub map and
// "Ration Delivery Details" panel display in the meantime.
const CENTRAL_WAREHOUSE = {
  label: 'Regional Ration Warehouse',
  address: 'Sector 20 Central Warehouse, Greater Noida, Uttar Pradesh',
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

    const [user, profile, latestBooking, settings] = await Promise.all([
      User.findById(userId),
      Family.findOne({ user: userId }),
      Booking.findOne({ user: userId }).sort({ createdAt: -1 }),
      getDistributionSettings(),
    ]);

    // Total members is derived strictly from the registered family members section
    const totalMembers = profile?.members?.length ? profile.members.length : (profile ? 1 : 0);
    const ration = computeRationBreakdown(totalMembers);

    const distributor = profile?.address ? findDistributorForDistrict(profile.address.district) : null;
    const deliveryToDistrict = distributor
      ? { label: distributor.name, address: distributor.address, lat: distributor.lat, lng: distributor.lng }
      : {
        label: 'Distributor pending assignment',
        address: 'Add your address on the Family Profile page to see your local distributor',
        lat: CENTRAL_WAREHOUSE.lat,
        lng: CENTRAL_WAREHOUSE.lng,
      };

    // Admin-edited delivery details win over the static defaults; district
    // lookup only fills the gap when no admin override has been saved yet.
    const adminFrom = settings.delivery?.from?.label ? settings.delivery.from : null;
    const adminTo = settings.delivery?.to?.label ? settings.delivery.to : null;
    const deliveryFrom = adminFrom
      ? { ...CENTRAL_WAREHOUSE, ...adminFrom }
      : { ...CENTRAL_WAREHOUSE, label: DEFAULT_WAREHOUSE.label };
    const deliveryTo = adminTo ? { ...deliveryToDistrict, ...adminTo } : deliveryToDistrict;

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
        from: deliveryFrom,
        to: deliveryTo,
      },
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    return res.status(500).json({ message: 'Failed to load terminal hub summary.' });
  }
};

export default { getDashboardSummary };
