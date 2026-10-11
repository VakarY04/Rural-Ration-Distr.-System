import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { DISTRIBUTOR_REGISTRY } from '../data/distributorRegistry.js';

// Path of the registry module so password resets can rewrite it on disk.
const REGISTRY_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'distributorRegistry.js'
);

// Staff registry helpers — the government registry file
// (backend/data/distributorRegistry.js) is the source of truth for staff
// access. Nobody can self-register as staff; a person may sign in through
// the Staff gateway only if their email/phone appears there with a matching
// role ('admin' via the Admin choice, 'distributor' via the Distributor
// choice — admins may also use the Distributor choice as supervisors).
// Normalizes an identifier for comparison (case/whitespace insensitive).
const normalize = (value) => String(value || '').trim().toLowerCase();

// Finds the provisioned registry entry matching an email OR mobile number.
// Returns null when the identifier does not belong to any government-
// provisioned staff member.
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

  const wantedRole = entry.role === 'admin' ? 'admin' : 'distributor';

  if (!user) {
    user = await UserModel.create({
      name: entry.name,
      email,
      phone: entry.phone,
      password: entry.password, // hashed automatically by the schema hook
      role: wantedRole,
      shopId: entry.shopId || null,
    });
    return user;
  }

  // Keep an existing mirror in lock-step with the registry (role/shop/name
  // may change when the department re-provisions a shop). Never touches the
  // stored password hash here — login/reset flows own that.
  let dirty = false;
  if (user.role !== wantedRole) {
    user.role = wantedRole;
    dirty = true;
  }
  const wantedShop = entry.shopId || null;
  if ((user.shopId || null) !== wantedShop) {
    user.shopId = wantedShop;
    dirty = true;
  }
  if (entry.name && user.name !== entry.name) {
    user.name = entry.name;
    dirty = true;
  }
  if (dirty) await user.save();

  return user;
};

// Persists a password change into the government registry file so the
// department's records stay in lock-step with what the distributor uses to
// log in. Matches by email OR phone; keeps `passwordHash` style entries
// hashed and plaintext-style entries plaintext. Returns true when an entry
// was found and updated.
export const updateRegistryPassword = (email, phone, newPassword) => {
  const entry = findRegistryEntry({ email, phone });
  if (!entry) return false;

  // Single hash shared by disk + memory so the two never diverge.
  const hashed = entry.passwordHash ? bcrypt.hashSync(newPassword, 10) : null;
  const replacement = hashed
    ? `passwordHash: '${hashed}',`
    : `password: '${String(newPassword).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const block = blockForEmail(raw, entry.email);
  if (!block) return false;
  const updated = block.replace(/(passwordHash|password):\s*'((?:[^'\\]|\\.)*)',/, replacement);
  if (updated === block || !writeRegistryGuarded(raw.replace(block, updated))) return false;

  if (hashed) {
    entry.passwordHash = hashed;
    delete entry.password; // hash supersedes any stale plaintext value
  } else {
    entry.password = newPassword;
  }
  return true;
};

// ── Registry provisioning (staff management UI) ──────────────────────────
// The login flow reads the IMPORTED array, so every mutation below updates
// the live in-memory entries first (no restart needed) and then persists the
// file for durability. Disk edits are SURGICAL (one block at a time) so the
// file's human-written comments and style survive provisioning actions.
// Every write is guarded by `node --check`: a failed syntax check rolls the
// file back and throws, so the registry is never left broken.

// Serializes one entry in the file's house style (single quotes, flat object).
const serializeEntry = (e) => {
  const q = (v) => `'${String(v ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const lines = [
    '  {',
    `    shopId: ${q(e.shopId)},`,
    `    name: ${q(e.name)},`,
    `    email: ${q(e.email)},`,
  ];
  if (e.passwordHash) lines.push(`    passwordHash: ${q(e.passwordHash)},`);
  else lines.push(`    password: ${q(e.password)},`);
  lines.push(`    phone: ${q(e.phone)},`);
  lines.push(`    role: ${q(e.role)},`);
  lines.push('  },');
  return lines.join('\n');
};

// Matches one flat `{...}` block by the email it contains. Entries are flat
// (no nested braces), so `[^}]*` cannot overrun into a neighbour.
const blockForEmail = (raw, email) => {
  const re = new RegExp(`\\{[^{}]*email:\\s*'${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[^{}]*\\},?`);
  const m = raw.match(re);
  return m ? m[0] : null;
};

// Writes content guardedly: syntax-check first, roll back on failure.
const writeRegistryGuarded = (next) => {
  const backup = fs.readFileSync(REGISTRY_PATH, 'utf8');
  fs.writeFileSync(REGISTRY_PATH, next, 'utf8');
  try {
    execFileSync(process.execPath, ['--check', REGISTRY_PATH], { stdio: 'ignore' });
    return true;
  } catch {
    fs.writeFileSync(REGISTRY_PATH, backup, 'utf8'); // never leave it broken
    return false;
  }
};

// Adds a provisioned entry (in-memory + disk). Throws on invalid input,
// duplicates, or a failed disk write (in-memory change is rolled back).
export const addRegistryEntry = ({ name, email, phone, password, role, shopId }) => {
  const clean = {
    shopId: String(shopId || '').trim(),
    name: String(name || '').trim(),
    email: normalize(email),
    phone: String(phone || '').replace(/\s+/g, ''),
    role: role === 'admin' ? 'admin' : 'distributor',
  };
  if (!clean.name || !clean.email || !clean.phone || !clean.shopId) {
    throw new Error('Name, email, phone and shop ID are required.');
  }
  if (!password || String(password).length < 8) {
    throw new Error('Provisioned password must be at least 8 characters.');
  }
  if (findRegistryEntry({ email: clean.email }) || findRegistryEntry({ phone: clean.phone })) {
    const err = new Error('A staff account with this email or mobile number already exists.');
    err.status = 409;
    throw err;
  }
  const entry = { ...clean, passwordHash: bcrypt.hashSync(String(password), 10) };
  DISTRIBUTOR_REGISTRY.push(entry);
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const closeAt = raw.lastIndexOf(']');
  if (closeAt === -1 || !writeRegistryGuarded(`${raw.slice(0, closeAt)}${serializeEntry(entry)}\n${raw.slice(closeAt)}`)) {
    DISTRIBUTOR_REGISTRY.pop();
    throw new Error('Could not save the staff registry. No changes were made.');
  }
  return entry;
};

// Removes a provisioned entry (in-memory + disk). Returns the removed entry
// or null. A failed disk write rolls the removal back.
export const removeRegistryEntry = (email) => {
  const target = normalize(email);
  const index = DISTRIBUTOR_REGISTRY.findIndex((e) => normalize(e.email) === target);
  if (index === -1) return null;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const block = blockForEmail(raw, target);
  if (!block) return null;
  // Drop the block plus the whitespace-only line its indentation leaves
  // behind, so add→remove round-trips byte-identically.
  const cleaned = raw
    .replace(block, '')
    .replace(/\n[ \t]*\n(\s*\])/, '\n$1')
    .replace(/\n[ \t]*\n([ \t]*\{)/, '\n$1');
  if (!writeRegistryGuarded(cleaned)) {
    throw new Error('Could not save the staff registry. No changes were made.');
  }
  return DISTRIBUTOR_REGISTRY.splice(index, 1)[0];
};

// Safe public shape for the staff list — never leaks passwords or hashes.
export const publicRegistryEntries = () =>
  DISTRIBUTOR_REGISTRY.map((e) => ({
    name: e.name,
    email: e.email,
    phone: e.phone,
    role: e.role,
    shopId: e.shopId || null,
  }));
