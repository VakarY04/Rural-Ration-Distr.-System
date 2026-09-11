import jwt from 'jsonwebtoken';

// Portal roles recognized across the platform. An 'admin' account is a
// supervisor-level distributor: it may sign in through the distributor
// portal and (later) access admin-only endpoints.
export const PORTAL_ROLES = ['citizen', 'distributor', 'admin'];

// Normalizes an incoming portal hint. Returns null when absent/unknown so
// legacy callers that omit the field keep working exactly as before.
export const normalizePortalRole = (requestedRole) => {
  if (!requestedRole) return null;
  const wanted = String(requestedRole).toLowerCase();
  return PORTAL_ROLES.includes(wanted) ? wanted : undefined;
};

// Returns an error message when the account may NOT enter the requested
// portal, or null when access is allowed (including when no portal was
// requested — the legacy behaviour).
export const portalAccessError = (user, requestedRole) => {
  if (!requestedRole) return null;
  if (requestedRole === undefined) return 'Unknown portal requested.';
  const entersDistributorPortal = requestedRole === 'distributor';
  const isStaff = user.role === 'distributor' || user.role === 'admin';
  if (entersDistributorPortal && isStaff) return null;
  if (user.role === requestedRole) return null;
  return `This account is not registered for the ${requestedRole} portal.`;
};

// Signs the standard 30-day JWT session token for any account type.
export const signSessionToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Builds the public profile payload returned by every auth endpoint.
export const sessionPayload = (user) => ({
  id: user._id,
  name: user.name || (user.role === 'citizen' ? 'Citizen User' : `${user.role} account`),
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  shopId: user.shopId || null,
});

// Emits the standard auth-success response (token + session payload) used by
// register/login/verifyOtp so the three handlers shape it identically.
export const sendAuthSuccess = (res, user, status = 200) =>
  res.status(status).json({ token: signSessionToken(user._id), data: sessionPayload(user) });

// Public-facing account shape returned by the profile read/update endpoints.
export const publicUser = (user) => ({
  name: user.name,
  avatar: user.avatar || null,
  phone: user.phone || null,
  email: user.email || null,
  role: user.role,
  shopId: user.shopId || null,
});
