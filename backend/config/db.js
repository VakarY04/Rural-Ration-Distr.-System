import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Family } from '../models/Family.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected safely to host: ${conn.connection.host}`);

    // Rebuild indexes to match the current schema. This drops any stale
    // indexes left over from earlier schema versions (e.g. a non-sparse
    // 'email' index on User, or a leftover 'userId' index on Family from
    // before that field was renamed to 'user') and rebuilds them correctly.
    await User.syncIndexes();
    await Family.syncIndexes();
    console.log('[MongoDB] Indexes synced with current schema.');
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
