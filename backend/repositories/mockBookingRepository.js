import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateId } from '../utils/random.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsPath = path.join(__dirname, '../data/seeds.json');

// Load initial static families into memory
let families = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));
// In-memory runtime database for active slot reservations
let appointments = [];

export const mockBookingRepository = {
  // Find a specific family by their card ID
  findFamilyById: async (familyId) => {
    return families.find(f => f.familyId === familyId) || null;
  },

  // Count how many families have already booked a specific date and time slot
  countBookingsInSlot: async (date, timeSlot) => {
    return appointments.filter(a => a.date === date && a.timeSlot === timeSlot).length;
  },

  // Save a new slot booking to memory
  createBooking: async (bookingData) => {
    const newBooking = {
      id: generateId('BK'),
      ...bookingData,
      createdAt: new Date(),
      isServed: false
    };
    appointments.push(newBooking);
    return newBooking;
  },

  // Get all active allocations mapped by delivery date (for the distributor manifest)
  getAllBookings: async () => {
    return appointments;
  },

  // Save a brand new family into our in-memory array database
  createFamily: async (familyData) => {
    const newFamily = {
      familyId: generateId('FAM'),
      ...familyData,
      mockAadhaarToken: `auth_token_hash_${Math.random().toString(16).substring(2, 8)}`
    };
    families.push(newFamily);
    return newFamily;
  }
};