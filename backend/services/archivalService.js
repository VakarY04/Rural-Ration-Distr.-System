// Phase 5.5 — expiry/archival (GIGW Q8). Past Confirmed bookings move to
// Archived so live pages (Terminal Hub "Next collection", distributor queue)
// never act on outdated slots. No new dependencies: plain Mongoose +
// setInterval in server.js + manual `npm run archive:bookings`.
// Announcements/slots archival hooks to Phase 7 (distributor-managed
// announcements do not exist yet) — this covers the booking ledger, which is
// the only date-driven live data today.
import Booking from '../models/Booking.js';

const todayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

export const archivePastBookings = async () => {
  const result = await Booking.updateMany(
    { distributionDate: { $lt: todayIST() }, status: 'Confirmed' },
    { $set: { status: 'Archived' } }
  );
  return result.modifiedCount ?? result.nModified ?? 0;
};
