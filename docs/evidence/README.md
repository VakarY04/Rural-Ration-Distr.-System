# Evidence pack — Final acceptance support (all phases)

Captured 2026-10-11 on this machine (Windows, Node v24.9.0) against the local
dev database (Atlas) and `vite preview` production builds. Raw logs sit next
to this file; nothing here is hand-typed — each file is tool output.

| File | What it proves |
|---|---|
| `build-frontend.log` | `vite build` passes; route chunks split (main ~474 KB, Leaflet/map + console lazy) |
| `backend-boot.log` | Backend boots clean: live line, Mongo connect, all-model index sync |
| `race-double-submit.log` | Phase 5: two parallel identical booking POSTs → exactly one 201 + one 409 `ALREADY_BOOKED`, ledger = 1 row, probe self-cleaned |
| `staff-provisioning.log` | Staff APIs: roster, provision → immediate login (no restart), duplicate → 409, distributor → 403, self-remove → 400, remove → login blocked |
| `lighthouse-landing.json` | Raw Lighthouse mobile (simulated 4G) report, production build |
| `lighthouse-metrics.txt` | Headline numbers from that report |

## Measured results (from the files above)

- Double-booking race: **PASS** — `201 + 409 ALREADY_BOOKED`, 1 ledger row.
  (This test caught a real gap: Booking unique indexes were code-defined but
  never built — fixed by syncing all models at boot, `backend/config/db.js`.)
- Lighthouse landing (lab Moto G4 / simulated 4G): **LCP 5.43 → 4.99 → 4.08 s**,
  perf score 0.51 → 0.60, CLS 0. Route splitting + hero 4368px/319 KB →
  1920px/83 KB did the moving; residual is the GSAP hero text starting at
  `opacity: 0` (LCP gated on JS under 4× CPU throttle). The 2.5 s lab target
  is **not met** — redesigning the animated hero for a lab number is deferred
  as disproportionate; field (real 4G, unthrottled CPU) reads far faster.
- Backup drill (`npm run backup:db`): users 7, families 2, bookings 12,
  grievances 2, settings 1, feedbacks 0 — manifest + restore steps in
  `backend/scripts/backupDatabase.js`.

## Explicitly NOT covered here (still open)

- Hindi + English end-to-end journey screenshots (register → profile →
  booking → help-desk) for both languages.
- Keyboard-only re-walkthrough after the new UI (Staff panel, Help security
  section, lazy-route fallback) and 200% zoom / 320 px re-checks.
- Timed rollback drill (< 30 min) and off-site backup copies.
- CERT-In/STQC audit, Safe-to-Host, CQW (blocked until public hosting).
- Dev-data note: `DistributionSettings.distributionDate` was stale
  (2026-10-08, past) on capture day — citizen booking locks to that day until
  an admin sets a fresh one in SlotManager.
