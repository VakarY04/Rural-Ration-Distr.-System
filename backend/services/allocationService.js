import { bookingRepository } from '../repositories/bookingRepository.js';
import { computeRationBreakdown } from './rationCalculator.js';

// Administrative rule constraints mapping to rural distribution guidelines
const MAX_FAMILIES_PER_SLOT = 6;  // Hard ceiling to prevent overcrowding at the center

export const allocationService = {
  /**
   * Calculates the target commodity weight following the official PDS
   * food-grain rule: max(35, 5 x members) kg per household per month.
   * Uses computeRationBreakdown as the single source of truth so this
   * always matches the Terminal Hub, Family Profile, and Booking page.
   * @param {number} totalMembers
   * @returns {number} Total allocation weight in kilograms
   */
  calculateRationWeight: (totalMembers) => {
    return computeRationBreakdown(totalMembers).totalKg;
  },

  /**
   * Evaluates slot constraints and securely commits a citizen booking reservation.
   * @param {string} familyId 
   * @param {string} date 
   * @param {string} timeSlot 
   * @returns {Promise<Object>} The confirmed distribution ledger entry
   */
  createSlotBooking: async (familyId, date, timeSlot) => {
    // 1. Retrieve the profile metadata using the active data layer strategy
    const family = await bookingRepository.findFamilyById(familyId);
    if (!family) {
      throw new Error(`Verification Error: No registered family found matching ID '${familyId}'`);
    }

    // 2. Enforce public safety guardrail (Max 6 families limit verification step)
    const currentSlotOccupancy = await bookingRepository.countBookingsInSlot(date, timeSlot);
    if (currentSlotOccupancy >= MAX_FAMILIES_PER_SLOT) {
      throw new Error(
        `Slot Capacity Exceeded: The ${timeSlot} window on ${date} has reached its maximum limit of ${MAX_FAMILIES_PER_SLOT} families. Please choose an alternative hour.`
      );
    }

    // 3. Compute commodity mass targeting
    const allocatedWeightKg = allocationService.calculateRationWeight(family.totalMembers);

    // 4. Construct the structured transaction log payload
    const bookingData = {
      familyId: family.familyId,
      rationCardNumber: family.rationCardNumber,
      headOfFamily: family.headOfFamily,
      totalMembers: family.totalMembers,
      allocatedWeightKg,
      date,
      timeSlot
    };

    // 5. Commit record using the abstract data bridge instance
    const confirmedBooking = await bookingRepository.createBooking(bookingData);
    return confirmedBooking;
  },

  /**
   * Compiles incoming reservation queues into a clean manifest layout for distributors.
   * Allows supply supervisors to prepare exact container capacities ahead of time.
   * @returns {Promise<Object>} Aggregated chronological logistics checklist
   */
  getDistributorPrePackingManifest: async () => {
    const activeBookings = await bookingRepository.getAllBookings();

    // Group structural rows into a chronological timetable grid map
    return activeBookings.reduce((manifest, booking) => {
      const { date, timeSlot, allocatedWeightKg } = booking;

      if (!manifest[date]) manifest[date] = {};
      if (!manifest[date][timeSlot]) {
        manifest[date][timeSlot] = {
          totalFamiliesScheduled: 0,
          totalSupplyRequiredKg: 0,
          ordersManifest: []
        };
      }

      manifest[date][timeSlot].totalFamiliesScheduled += 1;
      manifest[date][timeSlot].totalSupplyRequiredKg += allocatedWeightKg;
      manifest[date][timeSlot].ordersManifest.push(booking);

      return manifest;
    }, {});
  }
};