// Provisions a distributor/admin account for the distributor portal.
//
//   npm run seed:distributor
//   npm run seed:distributor -- "Ravi Kumar" ravi@district.gov.in S3curePass 9876543210
//
// Idempotent: re-running with the same email updates the existing account
// instead of failing on the unique index. Passwords are hashed by the
// User model's pre-save hook.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const [name = 'Demo Distributor', email = 'distributor@eration.gov.in', password = 'Distributor@123', phone = '9000000001'] =
  process.argv.slice(2);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[Seed] Connected to MongoDB');

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email, password, phone, role: 'admin' },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`[Seed] Distributor portal account ready:`);
  console.log(`        name  : ${user.name}`);
  console.log(`        email : ${user.email}`);
  console.log(`        phone : ${user.phone}`);
  console.log(`        role  : ${user.role}`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('[Seed] Failed:', error.message);
  process.exit(1);
});
