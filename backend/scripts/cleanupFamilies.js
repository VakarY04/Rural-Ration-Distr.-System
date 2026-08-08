// One-time cleanup script.
// Removes Family documents left over from the earlier broken 'userId' index
// bug (documents saved with no valid 'user' field). These are junk records
// that block building the correct unique index on 'user'.
//
// Run once from the backend/ folder:
//   node scripts/cleanupFamilies.js
//
// Safe to delete this file after running it successfully.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Family } from '../models/Family.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Cleanup] Connected to MongoDB.');

    // Find any family docs with a missing/null user field
    const badDocs = await Family.find({ user: null });
    console.log(`[Cleanup] Found ${badDocs.length} invalid family document(s) with no user:`);
    badDocs.forEach((doc) => {
      console.log(`  - _id: ${doc._id}, rationCardNumber: ${doc.rationCardNumber || 'N/A'}`);
    });

    if (badDocs.length > 0) {
      const result = await Family.deleteMany({ user: null });
      console.log(`[Cleanup] Deleted ${result.deletedCount} invalid document(s).`);
    } else {
      console.log('[Cleanup] Nothing to delete.');
    }

    // Also check for real duplicates (same user appearing more than once),
    // which could also block the unique index.
    const duplicates = await Family.aggregate([
      { $match: { user: { $ne: null } } },
      { $group: { _id: '$user', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicates.length > 0) {
      console.log(`[Cleanup] Warning: ${duplicates.length} user(s) have more than one family profile:`);
      duplicates.forEach((d) => console.log(`  - user: ${d._id}, docs: ${d.ids.join(', ')}`));
      console.log('[Cleanup] Please review these manually before restarting the server, since');
      console.log('[Cleanup] the unique index build will fail again until only one remains per user.');
    } else {
      console.log('[Cleanup] No duplicate user profiles found.');
    }

    console.log('[Cleanup] Done. You can now restart your server.');
  } catch (error) {
    console.error('[Cleanup] Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
