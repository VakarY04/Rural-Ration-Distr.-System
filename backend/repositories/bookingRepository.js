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