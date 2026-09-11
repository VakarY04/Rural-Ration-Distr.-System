// Staff roles matrix (Phase 7.1) — single source of truth for who may do what.
//
// | Action                              | distributor (FPS shop) | admin (district officer) |
// |-------------------------------------|------------------------|--------------------------|
// | View booking queue + stats          | own centre*            | all centres              |
// | Edit delivery labels/addresses      | NO (admin-only)        | YES                      |
// | Edit global ration items            | NO (admin-only)        | YES                      |
// | Manage slots / per-slot caps (7.2)  | NO                     | YES                      |
// | Grievances assign/resolve (7.3)     | own shop only          | all + escalate           |
// | Reports export (7.4)                | own shop               | all                      |
// | Provision staff accounts            | NO                     | YES                      |
//
// * Single-centre build today: the singleton DistributionSettings document is
// global, so "own centre" currently means read-only. Per-shop scoping
// (centreId on bookings/settings) lands with 7.2 — distributors then regain
// edit rights on their own shop record only.
//
// Gate for staff-only endpoints (distributor console + admin modules).
// Citizens hitting these routes get a clean 403 instead of leaking data.
export const requireStaff = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'distributor') {
    return res.status(403).json({ message: 'Staff access only. This endpoint is restricted.' });
  }
  return next();
};

// Admin-only gate — global configuration (delivery text, ration items, and
// from 7.2 slot windows/caps). Distributors get a 403 with a clear message
// so the console can explain why the Edit button is hidden.
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only. Contact your district officer to change this.' });
  }
  return next();
};

// Permission flags shipped inside GET /distributor/summary so the frontend
// never hardcodes role logic twice. Backend routes remain authoritative —
// these flags are display hints only.
export const permissionsFor = (role) => {
  const isAdmin = role === 'admin';
  const isStaff = isAdmin || role === 'distributor';
  return {
    canViewQueue: isStaff,
    canEditDelivery: isAdmin,
    canEditItems: isAdmin,
    canManageSlots: isAdmin,
    canManageGrievances: isStaff,
    // Placeholder for 7.4 — always false until reports ship.
    canViewReports: isStaff,
    canManageStaff: isAdmin,
  };
};

export default requireStaff;
