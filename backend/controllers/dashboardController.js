import User from '../models/User.js';
import Family from '../models/Family.js';
import Booking from '../models/Booking.js';
import { computeRationBreakdown } from '../services/rationCalculator.js';
import { findDistributorForDistrict } from '../data/distributors.js';
import { getDistributionSettings, DEFAULT_WAREHOUSE } from '../models/DistributionSettings.js';
import { getRequestUserId } from '../utils/requestUser.js';
import { sendError } from '../utils/httpError.js';

// Get an aggregated snapshot for the Terminal Hub (dashboard home) page:
// citizen name, household profile status, next booking, computed ration
// quota, and delivery route endpoints for the map.
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
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
        lat: DEFAULT_WAREHOUSE.lat,
        lng: DEFAULT_WAREHOUSE.lng,
      };

    // Admin-edited delivery details win over the static defaults; district
    // lookup only fills the gap when no admin override has been saved yet.
    const adminFrom = settings.delivery?.from?.label ? settings.delivery.from : null;
    const adminTo = settings.delivery?.to?.label ? settings.delivery.to : null;
    const deliveryFrom = adminFrom
      ? { ...DEFAULT_WAREHOUSE, ...adminFrom }
      : { ...DEFAULT_WAREHOUSE, label: DEFAULT_WAREHOUSE.label };
    const deliveryTo = adminTo ? { ...deliveryToDistrict, ...adminTo } : deliveryToDistrict;

    // Last-reviewed stamp for the Terminal Hub (GIGW Q5): freshest timestamp
    // across the household profile, latest booking and distribution settings.
    const stamped = [profile?.updatedAt, latestBooking?.updatedAt, settings?.updatedAt]
      .filter(Boolean)
      .map((d) => new Date(d).getTime());
    const updatedAt = stamped.length ? new Date(Math.max(...stamped)).toISOString() : null;

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
      updatedAt,
      delivery: {
        from: deliveryFrom,
        to: deliveryTo,
      },
    });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load terminal hub summary.',
      logLabel: 'Dashboard Summary Error:',
    });
  }
};
