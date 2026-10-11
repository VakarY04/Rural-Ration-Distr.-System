import rateLimit from 'express-rate-limit';

// Phase 6.2 — brute-force guards (GIGW S-chapter). Limits are per-IP per
// window; the handlers return the project's standard JSON shape so the
// EN/HI client mapping keeps working.
const jsonHandler = (message) => (req, res) =>
  res.status(429).json({ message });

// Login: 20 attempts / 15 min per IP — generous for a household sharing
// one rural kiosk IP, tight enough to blunt credential stuffing.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many login attempts. Please wait 15 minutes and try again.'),
});

// OTP send: 5 codes / 10 min per IP — blocks SMS/email bombing via send-otp.
export const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many OTP requests. Please wait 10 minutes and try again.'),
});

// OTP verify + password reset: 10 tries / 15 min — blocks 6-digit / token
// guessing without locking out genuine typos.
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many verification attempts. Please wait 15 minutes and try again.'),
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many reset attempts. Please wait 15 minutes and try again.'),
});
