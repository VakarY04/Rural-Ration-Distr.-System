import User from '../models/User.js';
import Booking from '../models/Booking.js';
import {
  normalizePortalRole,
  portalAccessError,
  sendAuthSuccess,
  publicUser,
} from '../utils/authHelpers.js';
import {
  findRegistryEntry,
  syncRegistryUserToDb,
  resolveRegistryUser,
  verifyRegistryCredentials,
} from '../utils/distributorRegistry.js';
import {
  normalizePhone,
  isValidPhone,
  normalizeEmail,
} from '../utils/validators.js';
import { generateOtp } from '../utils/random.js';
import { sendError } from '../utils/httpError.js';

// 1. Citizen Registration Controller
export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Public registration ALWAYS creates a citizen. Distributor accounts are
  // provisioned exclusively through the government registry file
  // (backend/data/distributorRegistry.js) and can never be self-registered.
  const normalizedPhone = normalizePhone(phone);

  try {
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const clash = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
    if (clash) {
      if (clash.email === normalizedEmail) {
        return res.status(400).json({ message: 'A citizen account with this email already exists.' });
      }
      return res.status(400).json({ message: 'A citizen account with this mobile number already exists.' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      role: 'citizen',
    });

    return sendAuthSuccess(res, user, 201);
  } catch (error) {
    return sendError(res, error, {
      message: 'Error establishing citizen registry footprint.',
      logLabel: 'Registration Error:',
    });
  }
};

// 2. Login Access Terminal Controller (citizen + distributor portals).
// Accepts an identifier that may be EITHER the registered email or the
// registered mobile number — both resolve to the same single account.
//
// CITIZEN portal  → verified against MongoDB credentials.
// STAFF portals   → verified against the government registry file
//                   (backend/data/distributorRegistry.js). Only provisioned
//                   distributors/admins can pass; self-registered accounts
//                   are rejected even if a matching MongoDB doc existed.
// `role` in the body is an optional portal hint — when present, accounts
// whose role doesn't match are rejected; when absent, legacy behaviour.
export const login = async (req, res) => {
  const { email, password } = req.body;
  const portalRole = normalizePortalRole(req.body.role);

  const identifier = normalizeEmail(email);
  const lookupQuery = identifier.includes('@')
    ? { email: identifier }
    : { phone: identifier.replace(/\s+/g, '') };

  try {
    let user;

    if (portalRole === 'distributor' || portalRole === 'admin') {
      // Government registry gate — match against the department's records.
      const entry = findRegistryEntry({ email: identifier });
      if (!entry) {
        return res.status(400).json({ message: 'Invalid credentials provided.' });
      }

      const passwordOk = await verifyRegistryCredentials(entry, password);
      if (!passwordOk) {
        return res.status(400).json({ message: 'Invalid credentials provided.' });
      }

      // Mirror the provisioned entry into MongoDB for session management.
      user = await syncRegistryUserToDb(User, entry);
    } else {
      user = await User.findOne(lookupQuery);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials provided.' });
      }

      // Use the schema instance method to verify hashed password parameters
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials provided.' });
      }
    }

    const accessError = portalAccessError(user, portalRole);
    if (accessError) {
      return res.status(403).json({ message: accessError });
    }

    return sendAuthSuccess(res, user);
  } catch (error) {
    return sendError(res, error, {
      message: 'Internal server error processing terminal access.',
      logLabel: 'Login Error:',
    });
  }
};

// 3. Send OTP Controller
export const sendOtp = async (req, res) => {
  const portalRole = normalizePortalRole(req.body.role);
  const phone = normalizePhone(req.body.phone);

  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: 'Please provide a valid phone number.' });
  }
  if (portalRole === undefined) {
    return res.status(400).json({ message: 'Unknown portal requested.' });
  }

  try {
    let user = await User.findOne({ phone });

    // Distributor portal OTP is gated by the government registry file —
    // the number must belong to a department-provisioned distributor.
    if (portalRole === 'distributor' || portalRole === 'admin') {
      user = await resolveRegistryUser(User, { phone });
      if (!user) {
        return res.status(404).json({ message: 'No distributor account found for this mobile number.' });
      }
    }

    // Generate a secure 6-digit OTP
    const otp = generateOtp();
    user = user || new User({ phone });
    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // Active for 5 minutes
    await user.save();

    if (process.env.NODE_ENV === 'production') {
      // 🚀 PRODUCTION: Send actual SMS text message via Fast2SMS / Twilio
      // await sendRealSms(phone, otp);
    } else {
      // 💻 LOCAL DEV: Log cleanly to terminal
      console.log(`\n===================================`);
      console.log(`📱 [DEVELOPMENT OTP CODE]`);
      console.log(`Phone: ${phone} | OTP: ${otp}`);
      console.log(`===================================\n`);
    }

    res.status(200).json({ message: 'OTP successfully sent to your mobile number.' });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to dispatch OTP verification code.',
      logLabel: 'Send OTP Error:',
    });
  }
};

// 4. Verify OTP Controller
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const portalRole = normalizePortalRole(req.body.role);
  const phone = normalizePhone(req.body.phone);

  try {
    const user = await User.findOne({
      phone,
      otp,
      otpExpire: { $gt: Date.now() } // Must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    const accessError = portalAccessError(user, portalRole);
    if (accessError) {
      return res.status(403).json({ message: accessError });
    }

    // Clear OTP fields once verified
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return sendAuthSuccess(res, user);
  } catch (error) {
    return sendError(res, error, {
      message: 'Internal server error during verification.',
      logLabel: 'Verify OTP Error:',
    });
  }
};

// Get the logged-in account's own details (name, phone, email, role)
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select(
      '-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire'
    );
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    res.status(200).json(publicUser(user));
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load account details.',
      logLabel: 'Get Account Details Error:',
    });
  }
};

// Update the logged-in account's own name / profile picture / phone / home
// address. Each role edits ONLY its own document (req.user scope), so admin,
// distributor and citizen profiles are each editable by their respective
// owners. Phone IS editable here so OTP-registered users can link (or correct)
// the mobile number tied to their email account. Email + role + shopId stay
// read-only since they are credentials / registry-provisioned identity.
export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { name, avatar, phone, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please provide your name.' });
    }

    // Guard against oversized uploads landing in MongoDB (~2MB cap on the
    // base64 string, comfortably covers a small compressed profile photo).
    if (avatar && avatar.length > 2_000_000) {
      return res.status(400).json({ message: 'Profile picture is too large. Please use a smaller image.' });
    }

    const update = { name: name.trim() };
    if (avatar !== undefined) update.avatar = avatar || null;

    if (address !== undefined && address !== null) {
      const clean = (v, max = 120) => String(v ?? '').trim().slice(0, max);
      update.address = {
        village: clean(address.village),
        block: clean(address.block),
        district: clean(address.district),
        state: clean(address.state),
        pincode: clean(address.pincode, 12),
      };
    }

    if (phone !== undefined && phone !== null) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number.' });
      }
      const clash = await User.findOne({ phone: normalizedPhone, _id: { $ne: userId } });
      if (clash) {
        return res.status(400).json({ message: 'This mobile number is already connected to another account.' });
      }
      update.phone = normalizedPhone;
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      returnDocument: 'after',
      runValidators: true,
    });

    res.status(200).json({ message: 'Account details updated.', ...publicUser(user) });
  } catch (error) {
    return sendError(res, error, { status: 400 });
  }
};

// Permanently deletes the logged-in account. Used by the "Delete Account"
// action on the citizen profile page.
export const deleteMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    // Remove the account's bookings too, otherwise they linger as orphaned
    // "families" in the distributor console after the user is gone.
    await Booking.deleteMany({ user: userId });
    res.status(200).json({ message: 'Your account has been permanently deleted.' });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to delete the account.',
      logLabel: 'Delete Account Error:',
    });
  }
};
