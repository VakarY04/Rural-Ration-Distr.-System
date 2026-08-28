import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DISTRIBUTOR_REGISTRY } from '../data/distributorRegistry.js';

// Path of the registry module so password resets can rewrite it on disk.
const REGISTRY_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'distributorRegistry.js'
);

// Normalizes an identifier for comparison (case/whitespace insensitive).
const normalize = (value) => String(value || '').trim().toLowerCase();

// Finds the provisioned registry entry matching an email OR mobile number.
// Returns null when the identifier does not belong to any government-
// provisioned distributor.
export const findRegistryEntry = ({ email, phone }) => {
  const identifier = normalize(email || phone);
  if (!identifier) return null;

  return (
    DISTRIBUTOR_REGISTRY.find((entry) => normalize(entry.email) === identifier) ||
    DISTRIBUTOR_REGISTRY.find((entry) => normalize(entry.phone) === identifier.replace(/\s+/g, '')) ||
    null
  );
};

// Verifies a candidate password against the registry entry. Supports both
// bcrypt hashes (`passwordHash`) and department-issued plaintext values
// (`password`) so operators may choose their storage preference.
export const matchRegistryPassword = async (entry, password) => {
  if (!entry || !password) return false;
  if (entry.passwordHash) return bcrypt.compare(password, entry.passwordHash);
  return entry.password === password;
};

// True only when the registry entry exists and the password matches. Used by
// the login flow so the credential check is expressed in one place.
export const verifyRegistryCredentials = async (entry, password) =>
  entry ? matchRegistryPassword(entry, password) : false;

// Resolves the provisioned registry entry for an email OR mobile number and
// mirrors it into MongoDB, returning the synced user (or null when the
// identifier does not belong to a government-provisioned distributor). This
// single helper replaces the duplicated lookup+sync block in login/sendOtp.
export const resolveRegistryUser = async (UserModel, { email, phone }) => {
  const entry = findRegistryEntry({ email, phone });
  if (!entry) return null;
  return syncRegistryUserToDb(UserModel, entry);
};

// Mirrors a provisioned registry entry into MongoDB (creating or reusing the
// account document) so JWT sessions and OTP storage keep working unchanged.
export const syncRegistryUserToDb = async (UserModel, entry) => {
  const email = normalize(entry.email);
  let user = await UserModel.findOne({ $or: [{ email }, { phone: entry.phone }] });

  if (!user) {
    user = await UserModel.create({
      name: entry.name,
      email,
      phone: entry.phone,
      password: entry.password, // hashed automatically by the schema hook
      role: entry.role === 'admin' ? 'admin' : 'distributor',
    });
  }

  return user;
};

// Persists a password change into the government registry file so the
// department's records stay in lock-step with what the distributor uses to
// log in. Matches by email OR phone; keeps `passwordHash` style entries
// hashed and plaintext-style entries plaintext. Returns true when an entry
// was found and updated.
export const updateRegistryPassword = (email, phone, newPassword) => {
  const byEmail = normalize(email);
  const byPhone = normalize(phone).replace(/\s+/g, '');
  if (!byEmail && !byPhone) return false;

  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');

  // The registry module is header comments + one exported array literal.
  // We splice only the array so human-written documentation stays intact.
  const exportStart = raw.indexOf('DISTRIBUTOR_REGISTRY');
  if (exportStart === -1) return false;
  const arrStart = raw.indexOf('[', exportStart);
  const arrEnd = raw.lastIndexOf(']');
  if (arrStart === -1 || arrEnd === -1 || arrEnd < arrStart) return false;

  const entries = JSON.parse(raw.slice(arrStart, arrEnd + 1));
  const entry = entries.find(
    (e) =>
      (byEmail && normalize(e.email) === byEmail) ||
      (byPhone && normalize(e.phone) === byPhone)
  );
  if (!entry) return false;

  if (entry.passwordHash) {
    entry.passwordHash = bcrypt.hashSync(newPassword, 10);
    delete entry.password; // hash supersedes any stale plaintext value
  } else {
    entry.password = newPassword;
  }

  fs.writeFileSync(REGISTRY_PATH, raw.slice(0, arrStart) + JSON.stringify(entries, null, 2) + raw.slice(arrEnd), 'utf8');
  return true;
};
