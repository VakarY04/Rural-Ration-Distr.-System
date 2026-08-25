// ============================================================================
// GOVERNMENT DISTRIBUTOR REGISTRY (source of truth for staff access)
// ============================================================================
// This file acts as the Food & Civil Supplies department's official database
// of Fair Price Shop distributors. A person can ONLY sign in through the
// distributor portal if their details appear below — nobody can self-register
// as staff.
//
// Each entry supports BOTH login methods:
//   • Email + password   (the `email` + `password` fields)
//   • Mobile OTP         (the `phone` field)
//
// Fields:
//   shopId       – official FPS identifier shown in reports
//   name         – full name of the provisioned distributor
//   email        – registered email (used for email+password login)
//   password     – password issued by the department for that email
//                  (OPTIONAL: set `passwordHash` instead to store a bcrypt
//                   hash; the plaintext field is then ignored. Password
//                   resets via the portal keep whichever style is in use.)
//   phone        – registered mobile number (used for OTP login)
//   role         – optional: 'distributor' (default) or 'admin'
//
// To grant a new distributor access: append an entry here. Nothing else
// needs to change — the backend mirrors the entry into MongoDB automatically
// on first login.
// ============================================================================

export const DISTRIBUTOR_REGISTRY = [
  {
    shopId: 'FPS-1001',
    name: 'Ramesh Kumar',
    email: 'ramesh.fps@eration.gov.in',
    password: 'Distributor@123',
    phone: '9876500001',
    role: 'distributor',
  },
  {
    shopId: 'FPS-ADM-01',
    name: 'Department Administrator',
    email: 'admin@eration.gov.in',
    password: 'Admin@12345',
    phone: '9876500002',
    role: 'admin',
  },
];
