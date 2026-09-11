import Booking from '../models/Booking.js';
import Family from '../models/Family.js';
import { computeRationBreakdown } from '../services/rationCalculator.js';
import { sendError } from '../utils/httpError.js';

// Reports (Phase 7.4) — entitlement vs allocation vs collection per district.
//
// Definitions (single source of truth = computeRationBreakdown, i.e.
// entitlement = max(35, 10 x members) kg — the README's stale "5 kg" line is
// docs drift, not code):
//   entitledKg   — monthly household entitlement summed over Family profiles
//                  in the district (members.length, min 1 per profile).
//   allocatedKg  — kg promised via bookings with live statuses
//                  (Confirmed + Collected); Cancelled/Archived excluded as
//                  void / past-cycle. Parsed from allocatedItems quantities.
//   collectedKg  — subset of allocatedKg actually handed over
//                  (status Collected only).
// District comes from Family.address.district joined by booking.user first,
// then rationCardNumber; unmatched bookings land in "Unassigned".

const parseKg = (value) => {
  const n = parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const bookingKg = (b) =>
  (b.allocatedItems || []).reduce((s, i) => s + parseKg(i?.quantity), 0);

const LIVE_STATUSES = ['Confirmed', 'Collected'];

export const buildReport = async () => {
  const [families, bookings] = await Promise.all([
    Family.find().lean(),
    Booking.find().lean(),
  ]);

  const byUser = new Map();
  const byCard = new Map();
  for (const f of families) {
    if (f.user) byUser.set(String(f.user), f);
    if (f.rationCardNumber) byCard.set(String(f.rationCardNumber), f);
  }
  const districtOf = (b) => {
    const fam =
      (b.user && byUser.get(String(b.user))) ||
      (b.rationCardNumber && byCard.get(String(b.rationCardNumber))) ||
      null;
    const d = String(fam?.address?.district || '').trim();
    return d || 'Unassigned';
  };

  const rows = new Map();
  const row = (district) => {
    if (!rows.has(district)) {
      rows.set(district, {
        district,
        families: 0,
        entitledKg: 0,
        allocatedKg: 0,
        collectedKg: 0,
        bookings: 0,
        collectedBookings: 0,
      });
    }
    return rows.get(district);
  };

  for (const f of families) {
    const d = String(f.address?.district || '').trim() || 'Unassigned';
    const members = Array.isArray(f.members) && f.members.length ? f.members.length : 1;
    const r = row(d);
    r.families += 1;
    r.entitledKg += computeRationBreakdown(members).totalKg;
  }

  for (const b of bookings) {
    if (!LIVE_STATUSES.includes(b.status)) continue;
    const r = row(districtOf(b));
    const kg = bookingKg(b);
    r.allocatedKg += kg;
    r.bookings += 1;
    if (b.status === 'Collected') {
      r.collectedKg += kg;
      r.collectedBookings += 1;
    }
  }

  const districts = [...rows.values()]
    .map((r) => ({
      ...r,
      entitledKg: Math.round(r.entitledKg),
      allocatedKg: Math.round(r.allocatedKg),
      collectedKg: Math.round(r.collectedKg),
      collectionRate: r.allocatedKg > 0 ? Math.round((r.collectedKg / r.allocatedKg) * 100) : 0,
    }))
    .sort((a, b) => a.district.localeCompare(b.district));

  const totals = districts.reduce(
    (t, r) => ({
      families: t.families + r.families,
      entitledKg: t.entitledKg + r.entitledKg,
      allocatedKg: t.allocatedKg + r.allocatedKg,
      collectedKg: t.collectedKg + r.collectedKg,
      bookings: t.bookings + r.bookings,
      collectedBookings: t.collectedBookings + r.collectedBookings,
    }),
    { families: 0, entitledKg: 0, allocatedKg: 0, collectedKg: 0, bookings: 0, collectedBookings: 0 }
  );
  totals.collectionRate = totals.allocatedKg > 0 ? Math.round((totals.collectedKg / totals.allocatedKg) * 100) : 0;

  return { districts, totals, generatedAt: new Date().toISOString() };
};

// GET /reports — staff JSON for the console panel.
export const getReports = async (req, res) => {
  try {
    return res.status(200).json(await buildReport());
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to build reports.',
      logLabel: 'Reports Error:',
    });
  }
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// GET /reports/export — staff CSV download (same rows as JSON).
export const exportReports = async (req, res) => {
  try {
    const { districts, totals } = await buildReport();
    const header = 'District,Families,Entitled (kg),Allocated (kg),Collected (kg),Collection Rate (%),Bookings,Collected Bookings';
    const lines = districts.map((r) =>
      [
        csvCell(r.district),
        r.families,
        r.entitledKg,
        r.allocatedKg,
        r.collectedKg,
        r.collectionRate,
        r.bookings,
        r.collectedBookings,
      ].join(',')
    );
    lines.push(
      ['TOTAL', totals.families, totals.entitledKg, totals.allocatedKg, totals.collectedKg, totals.collectionRate, totals.bookings, totals.collectedBookings].join(',')
    );
    const csv = `${header}\n${lines.join('\n')}\n`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="eration-district-report.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to export reports.',
      logLabel: 'Reports Export Error:',
    });
  }
};
