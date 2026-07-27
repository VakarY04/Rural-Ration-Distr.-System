import { Family } from '../models/Family.js';

export const familyController = {
  saveProfile: async (req, res) => {
    try {
      const { rationCardNumber, headOfFamily, members } = req.body;
      if (!members || members.length === 0) {
        return res.status(400).json({ error: 'Profiles require at least one member block entry.' });
      }

      const calculatedWeight = members.length * 10; 

      const profile = await Family.findOneAndUpdate(
        { userId: req.user.id },
        {
          rationCardNumber,
          headOfFamily,
          totalMembers: members.length,
          members,
          allocatedWeightKg: calculatedWeight
        },
        { new: true, upsert: true, runValidators: true }
      );

      return res.status(200).json({ success: true, message: 'Profile updated successfully.', data: profile });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const profile = await Family.findOne({ userId: req.user.id });
      // Return a clean 200 instead of a loud 404 error if new users lack profiles
      if (!profile) return res.status(200).json({ success: true, data: null });
      return res.json({ success: true, data: profile });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};