// Shared input-normalization + validation helpers used across auth,
// profile, and distributor-registry flows. Centralizing them keeps the
// rules consistent (e.g. phone digit-count) and removes copy-pasted logic.

// Strips whitespace and returns a clean phone string. A missing/non-string
// value collapses to an empty string rather than throwing.
export const normalizePhone = (value) => String(value ?? '').replace(/\s+/g, '').trim();

// True when the value holds at least 10 digits (ignoring spaces, punctuation
// and country prefixes). Used wherever a mobile number is required.
export const isValidPhone = (value) => normalizePhone(value).replace(/\D/g, '').length >= 10;

// Lower-cased, trimmed email — the canonical form stored in MongoDB and used
// for lookups so "Foo@Bar.com" and "foo@bar.com" resolve to the same account.
export const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();
