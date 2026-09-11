// ============================================================================
// GOVERNMENT STAFF REGISTRY (source of truth for staff access)
// ============================================================================
// This file acts as the Food & Civil Supplies department's official database
// of provisioned staff. A person can ONLY sign in through the Staff gateway
// if their details appear below — nobody can self-register as staff.
//
// The Staff Login box offers two roles; each entry's `role` decides which
// choice it may use:
//   • role: 'distributor' — Fair Price Shop staff. Signs in via the
//     Distributor choice (email+password or mobile OTP).
//   • role: 'admin'       — Department administrators. Signs in via the
//     Admin choice (email+password or mobile OTP). Admins may also use the
//     Distributor choice (supervisor access); distributors may NOT use the
//     Admin choice (rejected 403).
//
// Each entry supports BOTH login methods:
//   • Email + password   (the `email` + `password` fields)
//   • Mobile OTP         (the `phone` field)
//
// Fields:
//   shopId       – official FPS identifier shown in reports (distributors);
//                  admin entries use an ADM code instead (e.g. FPS-ADM-01)
//   name         – full name of the provisioned staff member
//   email        – registered email (used for email+password login)
//   password     – password issued by the department for that email
//                  (OPTIONAL: set `passwordHash` instead to store a bcrypt
//                   hash; the plaintext field is then ignored. Password
//                   resets via the portal keep whichever style is in use.)
//   phone        – registered mobile number (used for OTP login)
//   role         – required: 'distributor' or 'admin'
//
// To grant access: append an entry under the matching section below. Nothing
// else needs to change — the backend mirrors the entry into MongoDB
// automatically on first login.
// ============================================================================

export const DISTRIBUTOR_REGISTRY = [
  // ---- Department administrators (Admin choice) ----
  {
    shopId: 'FPS-ADM-01',
    name: 'Department Administrator',
    email: 'admin@eration.gov.in',
    password: 'Admin@12345',
    phone: '9876500002',
    role: 'admin',
  },
  // ---- Fair Price Shop distributors (Distributor choice) ----
  {
    shopId: 'FPS-1001',
    name: 'Ramesh Kumar',
    email: 'ramesh.fps@eration.gov.in',
    password: 'Distributor@123',
    phone: '9876500001',
    role: 'distributor',
  },
];

// Alias matching the Staff-gateway naming; same array, either import works.
export const STAFF_REGISTRY = DISTRIBUTOR_REGISTRY;
