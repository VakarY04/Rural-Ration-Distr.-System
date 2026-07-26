import { Family } from '../models/Family.js';

export const familyController = {
  saveProfile: async (req, res) => {
    try {
      const { rationCardNumber, headOfFamily, members } = req.body;
      
      if (!members || members.length === 0) {
        return res.status(400).json({ error: 'Profiles require at least one member block entry.' });
      }

      // Enforce your institutional guideline calculation directly inside controller boundaries
      const calculatedWeight = members.length * 10; 

      // Update if the profile structure exists for this authenticated token, otherwise create fresh
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

      return res.status(200).json({
        success: true,
        message: 'Family demographic criteria updated inside MongoDB collections.',
        data: profile
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const profile = await Family.findOne({ userId: req.user.id });
      if (!profile) return res.status(404).json({ message: 'No profile metrics established yet.' });
      return res.json({ success: true, data: profile });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};