import User from '../models/User.js';
import {
  normalizePortalRole,
  portalAccessError,
  signSessionToken,
  sessionPayload,
} from '../utils/authHelpers.js';
import {
  findRegistryEntry,
  matchRegistryPassword,
  syncRegistryUserToDb,
} from '../utils/distributorRegistry.js';

// 1. Citizen Registration Controller
export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Public registration ALWAYS creates a citizen. Distributor accounts are
  // provisioned exclusively through the government registry file
  // (backend/data/distributorRegistry.js) and can never be self-registered.
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

  try {
    if (!normalizedPhone || normalizedPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number.' });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
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

    res.status(201).json({
      token: signSessionToken(user._id),
      data: sessionPayload(user),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Error establishing citizen registry footprint.' });
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

  const identifier = String(email || '').trim().toLowerCase();
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

      const passwordOk = await matchRegistryPassword(entry, password);
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

    res.status(200).json({
      token: signSessionToken(user._id),
      data: sessionPayload(user),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error processing terminal access.' });
  }
};

// 3. Send OTP Controller
export const sendOtp = async (req, res) => {
  const { phone } = req.body;
  const portalRole = normalizePortalRole(req.body.role);

  if (!phone || phone.length < 10) {
    return res.status(400).json({ message: "Please provide a valid phone number." });
  }
  if (portalRole === undefined) {
    return res.status(400).json({ message: "Unknown portal requested." });
  }

  try {
    let user = await User.findOne({ phone });

    // Distributor portal OTP is gated by the government registry file —
    // the number must belong to a department-provisioned distributor.
    if (portalRole === 'distributor' || portalRole === 'admin') {
      const entry = findRegistryEntry({ phone });
      if (!entry) {
        return res.status(404).json({ message: 'No distributor account found for this mobile number.' });
      }
      // Mirror the provisioned entry into MongoDB so the OTP has a document.
      user = await syncRegistryUserToDb(User, entry);
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

    res.status(200).json({ message: "OTP successfully sent to your mobile number." });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to dispatch OTP verification code." });
  }
};

// 4. Verify OTP Controller
export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const portalRole = normalizePortalRole(req.body.role);

  try {
    const user = await User.findOne({
      phone,
      otp,
      otpExpire: { $gt: Date.now() } // Must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP code." });
    }

    const accessError = portalAccessError(user, portalRole);
    if (accessError) {
      return res.status(403).json({ message: accessError });
    }

    // Clear OTP fields once verified
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({
      token: signSessionToken(user._id),
      data: sessionPayload(user),
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error during verification." });
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
    res.status(200).json({
      name: user.name,
      avatar: user.avatar || null,
      phone: user.phone || null,
      email: user.email || null,
      role: user.role,
    });
  } catch (error) {
    console.error('Get Account Details Error:', error);
    res.status(500).json({ message: 'Failed to load account details.' });
  }
};

// Update the logged-in account's own name / profile picture / phone.
// Phone IS editable here so OTP-registered users can link (or correct) the
// mobile number tied to their email account. Email stays read-only since
// it's the primary credential for password login.
export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { name, avatar, phone } = req.body;

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

    if (phone !== undefined && phone !== null) {
      const normalizedPhone = String(phone).replace(/\s+/g, '');
      if (normalizedPhone.replace(/\D/g, '').length < 10) {
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

    res.status(200).json({
      message: 'Account details updated.',
      name: user.name,
      avatar: user.avatar || null,
      phone: user.phone || null,
      email: user.email || null,
      role: user.role,
    });
  } catch (error) {
    console.error('Update Account Details Error:', error);
    res.status(400).json({ message: error.message || 'Failed to update account details.' });
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
    res.status(200).json({ message: 'Your account has been permanently deleted.' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ message: 'Failed to delete the account.' });
  }
};
