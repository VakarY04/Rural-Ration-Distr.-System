import Family from '../models/Family.js';

// Get Family Profile for Authenticated User
export const getFamilyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access token.' });
    }

    const profile = await Family.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'No family profile found for this user.' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Get Family Profile Error:', error);
    return res.status(500).json({ message: 'Error retrieving family profile records.' });
  }
};

// Create or Update Family Profile
export const updateFamilyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access token.' });
    }

    const { rationCardNumber, headOfFamily, members } = req.body;

    if (!rationCardNumber || !headOfFamily) {
      return res.status(400).json({
        message: 'Please provide both Ration Card Document ID and Head of Family representative name.',
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

    // Modern Mongoose update options using returnDocument: 'after'
    const updatedProfile = await Family.findOneAndUpdate(
      { user: userId },
      {
        rationCardNumber: rationCardNumber.trim(),
        headOfFamily: headOfFamily.trim(),
        members: sanitizedMembers,
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Profile changes saved successfully!',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Update Family Profile Error:', error);
    return res.status(400).json({
      message: error.message || 'Failed to update family profile details.',
    });
  }
};

// Export object bundle to support `import { familyController }` or `import familyController` in apiRoutes.js
export const familyController = {
  getFamilyProfile,
  updateFamilyProfile,
};

export default familyController;