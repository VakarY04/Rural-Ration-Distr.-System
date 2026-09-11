// Provisions a distributor/admin account for the distributor portal.
//
//   npm run seed:distributor
//   npm run seed:distributor -- "Ravi Kumar" ravi@district.gov.in S3curePass 9876543210 distributor FPS-1001
//   npm run seed:distributor -- "Dept Admin" admin@eration.gov.in Admin@12345 9876500002 admin FPS-ADM-01
//
// Idempotent: re-running with the same email updates the existing account
// instead of failing on the unique index. Passwords are hashed by the
// User model's pre-save hook. Role must be distributor|admin (7.1 matrix).
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const [name = 'Demo Distributor', email = 'distributor@eration.gov.in', password = 'Distributor@123', phone = '9000000001', roleArg = 'distributor', shopIdArg = 'FPS-1001'] =
  process.argv.slice(2);

const role = roleArg === 'admin' ? 'admin' : 'distributor';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[Seed] Connected to MongoDB');

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email, password, phone, role, shopId: shopIdArg || null },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`[Seed] Distributor portal account ready:`);
  console.log(`        name  : ${user.name}`);
  console.log(`        email : ${user.email}`);
  console.log(`        phone : ${user.phone}`);
  console.log(`        role  : ${user.role}`);
  console.log(`        shopId: ${user.shopId || '(none)'}`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('[Seed] Failed:', error.message);
  process.exit(1);
});
