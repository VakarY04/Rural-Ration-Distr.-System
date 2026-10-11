import User from '../models/User.js';
import { normalizeEmail, normalizePhone, isValidPhone } from '../utils/validators.js';
import {
  publicRegistryEntries,
  addRegistryEntry,
  removeRegistryEntry,
  findRegistryEntry,
  syncRegistryUserToDb,
} from '../utils/distributorRegistry.js';
import { sendError } from '../utils/httpError.js';

// Staff provisioning (admin-only, 7.1 matrix) — closes the README open item
// "staff-provisioning UI". Provisioned entries land in the government
// registry file (the staff gateway's source of truth) with a bcrypt hash,
// plus a mirrored User document so sessions work immediately — no restart.

// GET /staff — provisioned roster, safe fields only (never hashes).
export const listStaff = async (req, res) => {
  try {
    const entries = publicRegistryEntries();
    const mirrors = await User.find({ role: { $in: ['distributor', 'admin'] } })
      .select('email role shopId')
      .lean();
    const activeByEmail = new Map(mirrors.map((u) => [String(u.email || '').toLowerCase(), u]));
    res.status(200).json({
      staff: entries.map((e) => ({ ...e, active: activeByEmail.has(e.email.toLowerCase()) })),
    });
  } catch (error) {
    return sendError(res, error, { message: 'Failed to load staff roster.' });
  }
};

// POST /staff — provision a distributor or admin account.
export const provisionStaff = async (req, res) => {
  const { name, email, phone, password, role, shopId } = req.body || {};
  try {
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(phone);
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ message: 'A valid staff email is required.' });
    }
    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number.' });
    }
    if (role !== 'distributor' && role !== 'admin') {
      return res.status(400).json({ message: 'Role must be distributor or admin.' });
    }
    // A citizen account holding the same email/phone would collide with the
    // registry mirror — refuse rather than silently merging identities.
    const clash = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
      role: 'citizen',
    }).lean();
    if (clash) {
      return res.status(409).json({ message: 'A citizen account already uses this email or mobile number.' });
    }

    const entry = addRegistryEntry({ name, email: cleanEmail, phone: cleanPhone, password, role, shopId });
    const mirror = await syncRegistryUserToDb(User, entry);
    res.status(201).json({
      message: `${role === 'admin' ? 'Admin' : 'Distributor'} account provisioned.`,
      staff: {
        name: entry.name,
        email: entry.email,
        phone: entry.phone,
        role: entry.role,
        shopId: entry.shopId || null,
        active: !!mirror,
      },
    });
  } catch (error) {
    if (error?.status === 409) return res.status(409).json({ message: error.message });
    if (error?.message && /required|8 characters/.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    return sendError(res, error, { message: 'Failed to provision staff account.' });
  }
};

// DELETE /staff/:email — deprovision: registry entry removed (gateway login
// blocks immediately) + mirror account deleted. Cannot remove yourself or
// the last remaining admin.
export const deprovisionStaff = async (req, res) => {
  const target = normalizeEmail(req.params.email);
  try {
    if (!target) return res.status(400).json({ message: 'Staff email is required.' });
    const self = normalizeEmail(req.user?.email);
    if (self && self === target) {
      return res.status(400).json({ message: 'You cannot deprovision your own account.' });
    }
    const entry = findRegistryEntry({ email: target });
    if (!entry) return res.status(404).json({ message: 'No staff account found for this email.' });
    if (entry.role === 'admin') {
      const admins = publicRegistryEntries().filter((e) => e.role === 'admin');
      if (admins.length <= 1) {
        return res.status(400).json({ message: 'The last admin account cannot be removed.' });
      }
    }
    removeRegistryEntry(target);
    await User.deleteOne({ email: target });
    res.status(200).json({ message: 'Staff account deprovisioned.' });
  } catch (error) {
    return sendError(res, error, { message: 'Failed to deprovision staff account.' });
  }
};
