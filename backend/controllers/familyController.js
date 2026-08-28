import Family from '../models/Family.js';
import { getRequestUserId } from '../utils/requestUser.js';
import { sendError } from '../utils/httpError.js';

// Get Family Profile for Authenticated User
export const getFamilyProfile = async (req, res) => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access token.' });
    }

    const profile = await Family.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'No family profile found for this user.' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return sendError(res, error, {
      message: 'Error retrieving family profile records.',
      logLabel: 'Get Family Profile Error:',
    });
  }
};

// Create or Update Family Profile
export const updateFamilyProfile = async (req, res) => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access token.' });
    }

    const { rationCardNumber, headOfFamily, address, members } = req.body;

    if (!rationCardNumber || !headOfFamily) {
      return res.status(400).json({
        message: 'Please provide both Ration Card Document ID and Head of Family representative name.',
      });
    }

    if (!address?.village || !address?.district || !address?.state) {
      return res.status(400).json({
        message: 'Please provide your village/town, district, and state so we can assign your local distributor.',
      });
    }

    // ✅ Fallback map ensuring relation field is never undefined
    const sanitizedMembers = Array.isArray(members)
      ? members.map((m) => ({
          name: m.name || 'Member',
          age: Number(m.age) || 0,
          relation: m.relation || m.role || m.relationship || 'Dependent',
        }))
      : [];

    const updatedProfile = await Family.findOneAndUpdate(
      { user: userId },
      {
        rationCardNumber: rationCardNumber.trim(),
        headOfFamily: headOfFamily.trim(),
        address: {
          village: address.village.trim(),
          block: address.block?.trim() || '',
          district: address.district.trim(),
          state: address.state.trim(),
          pincode: address.pincode?.trim() || '',
        },
        members: sanitizedMembers,
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Profile changes saved successfully!',
      profile: updatedProfile,
    });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to update family profile details.',
      logLabel: 'Update Family Profile Error:',
    });
  }
};
