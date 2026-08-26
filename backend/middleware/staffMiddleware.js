// Gate for staff-only endpoints (distributor console + admin modules).
// Citizens hitting these routes get a clean 403 instead of leaking data.
export const requireStaff = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'distributor') {
    return res.status(403).json({ message: 'Staff access only. This endpoint is restricted.' });
  }
  return next();
};

export default requireStaff;
