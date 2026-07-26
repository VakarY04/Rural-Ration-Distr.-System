import { mockBookingRepository } from './mockBookingRepository.js';
import { mongoBookingRepository } from './mongoBookingRepository.js';
import dotenv from 'dotenv';

dotenv.config();

// Select active strategy instance depending on ecosystem configurations
const dataSource = process.env.DATA_SOURCE || 'MOCK';

export const bookingRepository = dataSource === 'MONGO' 
  ? mongoBookingRepository 
  : mockBookingRepository;

console.log(`[Repository Manager] Operating with data strategy instance: ${dataSource}`);

// Save a brand new family into our in-memory array database
  createFamily: async (familyData) => {
    const newFamily = {
      familyId: `FAM-${Math.floor(100 + Math.random() * 900)}`,
      ...familyData,
      mockAadhaarToken: `auth_token_hash_${Math.random().toString(16).substring(2, 8)}`
    };
    families.push(newFamily);
    return newFamily;
  }