import Booking from '../models/Booking.js';
import Family from '../models/Family.js';
import { computeRationBreakdown } from '../services/rationCalculator.js';
import { sendError } from '../utils/httpError.js';

// Reports (Phase 7.4) — entitlement vs allocation vs collection per district.
//
// Definitions (single source of truth = computeRationBreakdown, i.e.
// entitlement = max(35, 10 x members) kg — the README's stale "5 kg" line is
// docs drift, not code):
//   families      — households holding at least one LIVE booking
//                  (Confirmed + Collected) in the cycle. Profiles without a
//                  live booking are excluded, so this matches the Families
//                  Details queue. Past cycles drop out via Archived status.
//   entitledKg   — monthly household entitlement summed over those same
//                  counted families (members.length, min 1 per profile).
//   bookings     — live booking RECORDS counted once per family: each
//                  household contributes only its latest live booking (by
//                  distribution date, then newest first). A missed pickup
//                  superseded by a fresh booking must not count twice, so this
//                  always agrees with the Families column.
//   allocatedKg  — kg promised via those counted bookings, parsed from
//                  allocatedItems quantities.
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
  const householdSize = (fam) =>
    fam && Array.isArray(fam.members) && fam.members.length ? fam.members.length : 1;

  // One row PER FAMILY (not per district): village + district shown together
  // and the head named, so staff can see exactly which household each line
  // is. A household holding two live records (e.g. a missed pickup superseded
  // by a fresh booking) contributes only its latest — by distribution date,
  // then newest first — so Bookings always agrees with Families. Profiles
  // without a live booking never appear.
  const latestByFamily = new Map();
  for (const b of bookings) {
    if (!LIVE_STATUSES.includes(b.status)) continue;
    const key =
      (b.user && `u:${String(b.user)}`) ||
      (b.rationCardNumber && `c:${String(b.rationCardNumber)}`) ||
      `id:${String(b._id)}`;
    const prev = latestByFamily.get(key);
    if (
      !prev ||
      String(b.distributionDate || '') > String(prev.distributionDate || '') ||
      (b.distributionDate === prev.distributionDate &&
        new Date(b.createdAt) > new Date(prev.createdAt))
    ) {
      latestByFamily.set(key, b);
    }
  }

  const districts = [...latestByFamily.values()]
    .map((b) => {
      const fam =
        (b.user && byUser.get(String(b.user))) ||
        (b.rationCardNumber && byCard.get(String(b.rationCardNumber))) ||
        null;
      const kg = bookingKg(b);
      const collected = b.status === 'Collected';
      const allocatedKg = Math.round(kg);
      const collectedKg = collected ? allocatedKg : 0;
      return {
        village: String(fam?.address?.village || '').trim() || '—',
        district: String(fam?.address?.district || '').trim() || 'Unassigned',
        head: String(fam?.headOfFamily || b.headOfFamily || '').trim() || '—',
        families: 1,
        entitledKg: Math.round(computeRationBreakdown(householdSize(fam)).totalKg),
        allocatedKg,
        collectedKg,
        collectionRate: allocatedKg > 0 ? Math.round((collectedKg / allocatedKg) * 100) : 0,
        bookings: 1,
        collectedBookings: collected ? 1 : 0,
      };
    })
    .sort(
      (a, b) =>
        a.district.localeCompare(b.district) ||
        a.village.localeCompare(b.village) ||
        a.head.localeCompare(b.head)
    );

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
    const header = 'Village,District,Family Head,Entitled (kg),Allocated (kg),Collected (kg),Collection Rate (%),Bookings';
    const lines = districts.map((r) =>
      [
        csvCell(r.village),
        csvCell(r.district),
        csvCell(r.head),
        r.entitledKg,
        r.allocatedKg,
        r.collectedKg,
        r.collectionRate,
        r.bookings,
      ].join(',')
    );
    lines.push(
      ['TOTAL', '', totals.families, totals.entitledKg, totals.allocatedKg, totals.collectedKg, totals.collectionRate, totals.bookings].join(',')
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
