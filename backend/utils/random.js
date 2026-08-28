// Small random-generation helpers shared by OTP, ticket, and in-memory id
// creation so the math lives in one place.

// Inclusive integer in [min, max].
export const randomInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

// 6-digit one-time-passcode as a string (e.g. "042917").
export const generateOtp = () => String(randomInt(100000, 999999));

// Prefixed identifier like "BK-4821" or "FAM-307".
export const generateId = (prefix) => `${prefix}-${randomInt(1000, 9999)}`;
