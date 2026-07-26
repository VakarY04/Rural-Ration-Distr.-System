import { allocationService } from '../services/allocationService.js';

export const bookingController = {
  /**
   * Captures citizen slot selections, runs validation rules, and commits bookings.
   */
  createBooking: async (req, res) => {
    try {
      const { familyId, date, timeSlot } = req.body;

      // Validate basic incoming payload parameters
      if (!familyId || !date || !timeSlot) {
        return res.status(400).json({ 
          error: 'Bad Request: familyId, date, and timeSlot fields are strictly required.' 
        });
      }

      // Execute validation and generation sequence inside business engine
      const confirmedBooking = await allocationService.createSlotBooking(familyId, date, timeSlot);

      return res.status(201).json({
        success: true,
        message: 'Slot allocation successfully secured and logged.',
        data: confirmedBooking
      });
    } catch (error) {
      // Gracefully return a 400 error block if capacity ceilings or ID validations trigger an exception
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Retrieves structural manifests tracking commodity packaging constraints for the distributor dashboard.
   */
  getManifest: async (req, res) => {
    try {
      const prePackingManifest = await allocationService.getDistributorPrePackingManifest();
      return res.status(200).json({
        success: true,
        data: prePackingManifest
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Internal Server Error encountered while generating distributor logistics summaries.' 
      });
    }
  }
};

/**
   * Registers a incoming family profile, storing members array metrics.
   */
  registerFamily: async (req, res) => {
    try {
      const { rationCardNumber, headOfFamily, totalMembers, members, photoUrl } = req.body;

      if (!rationCardNumber || !headOfFamily || !members || members.length === 0) {
        return res.status(400).json({ error: 'Missing mandatory registration layout parameters.' });
      }

      const newFamily = await bookingRepository.createFamily({
        rationCardNumber,
        headOfFamily,
        totalMembers: parseInt(totalMembers),
        members,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      });

      return res.status(201).json({
        success: true,
        message: 'Family profile securely registered under state guidelines.',
        data: newFamily
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };