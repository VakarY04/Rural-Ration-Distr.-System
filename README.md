# E-Ration Portal — Rural Ration Distribution System

> **Status: Work in progress — not completed.** Citizen side + staff console core flows are implemented (see below). Several guideline and product items are still pending — listed explicitly under [What's Left To Do](#whats-left-to-do---explicitly-not-finished).

A MERN-stack web application for a rural Public Distribution System (PDS) — the government scheme that distributes subsidized food grains to households through local ration (FPS) shops. The app connects three roles — **Citizen, Distributor (FPS shop operator), and Admin (district officer)** — around one shared loop: household profile → slot booking → collection → grievance/reporting.

Full guideline reference lives in `INDIAN_GOVT_WEBSITE_GUIDELINES.md` (GIGW 3.0 + DBIM 3.0 + GuDApps + CERT-In). Phase-by-phase progress lives in `ROADMAP_GOVT_GRADE.md`.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Lucide icons, Leaflet (maps), GSAP + SplitType (landing animation)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI:** Google Gemini API for grievance triage in the AI Help Desk (with offline rule-based fallback so filing never depends on the key)
- **Auth:** JWT, email/password + phone-OTP login, forgot/reset-password via email token
- **i18n:** Custom `t(key)` dictionary in `frontend/src/i18n/{en,hi}.js` + `LanguageContext`, persisted as `eration_lang`

---

## The Three Roles — Functions & Responsibilities

Role is stored on `User.role`: `citizen | distributor | admin`. Backend gates are authoritative (`middleware/staffMiddleware.js` + `authMiddleware.js`); frontend permission flags from `GET /distributor/summary` are display hints only.

| Action | Citizen | Distributor (FPS shop) | Admin (district officer) |
|---|---|---|---|
| Register / login, manage own household | YES | — | — |
| View booking queue + stats | — | Own centre* | All centres |
| Mark booking Collected / revert to Confirmed (`PATCH /distributor/bookings/:id`) | — | YES (distributor-only writes, admin is rejected) | NO (read-only) |
| View household record (`GET /distributor/families/:rationCardNumber`) | — | YES | YES |
| Edit delivery labels/addresses (`PUT /distributor/delivery`) | — | NO (403, read-only) | YES |
| Edit global ration items (`PUT /distributor/items`) | — | NO (403, read-only) | YES |
| Manage slot windows / per-slot caps / close bookings (`PUT /slots`) | — | NO (read-only view) | YES |
| Grievance queue: assign / track / resolve (`PATCH /grievances/:id`) | Files + tracks own via `POST /grievances`, `GET /grievances/mine` | Own shop only (today shared queue — see note) | All + escalate |
| Reports: entitlement vs allocation vs collection (`GET /reports`, `/reports/export` CSV) | — | Own shop (today shared data) | All |
| Provision staff accounts | — | NO | YES (role flag `canManageStaff`; dedicated UI still pending) |

\* **Single-centre note:** today there is one singleton `DistributionSettings` document, so "own centre" currently means read-only access to the shared queue/settings. Per-shop scoping (`centreId` on bookings/settings) is a pending item — distributors regain edit rights on their own shop record only once that lands.

### 1. Citizen — household owner
**Responsibility:** keep household record correct, book a collection slot, collect grain, raise issues.
- Register / log in (email+password **or** phone+OTP), forgot/reset password.
- **Terminal Hub (`DashboardHome`):** profile-completion status, next collection date, monthly quota at a glance; live Leaflet+OSM route map (warehouse → assigned collection centre); household + appointment summaries; `Last updated/reviewed` date.
- **Family Profile:** account details (name, avatar upload, read-only phone/email), ration card ID + head of family, address (village/block/district/state/PIN — determines distributor assignment), inline add/edit/remove family members; live monthly ration estimate.
- **Ration Bookings:** pick date + live slot window (remaining counts, Full/Closed disabled), quota shown alongside; server enforces past-date, duplicate, unknown-slot, closed-slot, and capacity rules.
- **AI Help Desk (`AiSupportPage`):** describe issue in plain language (Hindi/English) → rule-based triage + optional Gemini text → category/summary/action; one click files it as a tracked grievance ticket with reference.
- **My Grievances, Feedback, Help, Sitemap, Policies:** track own tickets + resolution, submit feedback (ticket reference, Mongo-stored, owner-emailed when SMTP set), read Help (what to carry, formats, helpline hours), use shared `SiteFooter` on every route.

### 2. Distributor — FPS shop operator
**Responsibility:** run the local distribution: serve the queue, confirm handovers.
- Staff login through the same `/login` portal (role-based redirect to `/distributor`).
- **Console Home:** greeting + role badge, stat blocks (families booked, total/confirmed bookings, grain committed kg), full-width delivery route map, booked-families queue (`BookingsTable`) — deduplicated by ration card number.
- **Families Details page:** search/open any household (`FamilyDetailsDialog`: members + entitlement + latest booking).
- **Collection action:** mark `Confirmed → Collected` on handover, or revert `Collected → Confirmed` on mistake. Admins never see these buttons (API rejects them).
- **Ration Details page (read-only for this role):** items, delivery addresses, slot windows + `updatedAt`; sees `editor.adminOnly` notice instead of Edit buttons.
- **Grievance + Reports:** staff queue with status filter + stats; reports panel (totals + per-district table + CSV download) — currently over shared data until per-shop scoping lands.
- Own staff profile page (name, avatar, `shopId`, address on `User`, not on `Family`).

### 3. Admin — district officer
**Responsibility:** configure the distribution and handle escalations across centres.
- Everything a distributor can *view*, plus all *writes* on global config:
  - **Delivery editor:** warehouse → collection-centre labels/addresses (coordinates stay infrastructure defaults so maps never break).
  - **Items editor:** global ration items list (max 12, each needs a name, qty ≥ 0).
  - **SlotManager (full-width admin editor):** create windows (max 8, unique labels), set per-slot caps (1–100 families), open/close bookings, set/clear fixed distribution date (IST-validated, never past). Booking guard reads this live template → `UNKNOWN_SLOT` / `SLOT_CLOSED` / `SLOT_FULL`.
- **Complaints page (admin-only nav item, distributors have no complaints UI):** `GrievanceQueue` — filter by Open/In Review/Resolved, assign, change category, resolve **with mandatory resolution note**; resolving notifies citizen in-app + by email when SMTP is configured.
- **ReportsPanel:** entitlement vs allocation vs collection per district (Family join by `user` then `rationCardNumber`, `Unassigned` fallback), collection-rate %, CSV export.
- **Staff provisioning:** `permissionsFor()` already exposes `canManageStaff: admin-only`; dedicated provision/deactivate UI is still pending.

---

## What Is Implemented So Far

### Citizen side — done
- Landing page (GSAP/SplitType typography, tricolor motif, optimized WebP hero).
- Auth: register/login, phone OTP (expiring, bcrypt-hashed passwords, short-lived JWTs), forgot/reset with single-use expiring tokens.
- Terminal Hub, Family Profile, Booking form with live availability (`GET /slots/availability?date=`), AI Help Desk + grievance filing/tracking.
- Shared dashboard shell: account chip, skip link, a11y toolbar, `EN/हिंदी` toggle, `SiteFooter`.
- Print CSS: booking confirmation + ration details print cleanly on A4.

### Staff side — done (Roadmap Phase 7)
- **7.1 Roles matrix** — `staffMiddleware.js` matrix + `permissionsFor()`; `PUT /distributor/delivery|items` are `requireAdmin` (403 for distributors); `GET /summary` ships `{role, shopId, permissions}`; console badge + read-only notices.
- **7.2 Slot & capacity management** — `DistributionSettings.slots` + `slotController` (`GET /slots`, `GET /slots/availability`, `PUT /slots` admin-only); server guard: `countDocuments` vs capacity + unique `{user,date}` + `{card,date}` + `{date,slot}` indexes, `E11000 → 409`; client maps `SLOT_FULL` / `ALREADY_BOOKED` / `PAST_DATE` to EN+HI strings.
- **7.3 Grievance queue wired to AI triage** — `Grievance` model + `POST /grievances` (rules + optional Gemini) + `GET /grievances/mine` + `GET /grievances` staff queue + `PATCH /grievances/:id` (resolution required, email notify on resolve).
- **7.4 Reports** — `reportController` `GET /reports` JSON + `GET /reports/export` CSV; `ReportsPanel` totals + per-district table + download (EN/HI).
- Expiry job: `services/archivalService.js` flips past Confirmed → Archived (IST); `scripts/archivePastBookings.js` + `npm run archive:bookings`; server runs 60s after boot + every 24h; Archived hidden from live queue.

### Cross-cutting — done
- **Accessibility (Phase 1):** skip links + `id="main"` targets, a11y toolbar (A−/A/A+, contrast, highlight links, hide images, persisted), keyboard-only walkthrough passed, contrast audit (light-bg `text-slate-400` → slate-500 ≈4.8:1), 200% zoom + 320px fixes, collapsible sidebar.
- **Content furniture (Phase 2):** `Last updated/reviewed` dates, shared `SiteFooter` (About, Contact, Feedback, Help, Sitemap, Terms, Privacy, Accessibility, Copyright), five policy pages (`pages/info/policies.js`, WIM = owner), Help page, Search+Sitemap with live filter, feedback inbox (`POST /api/feedback`).
- **Multilingual (Phase 3):** `en.js`/`hi.js` ~330 keys, `LanguageToggle` on all shells, `<html lang>` flips, Noto Sans Devanagari woff2 + SemiBold 600, full citizen + staff pass, `hi-IN` date locale.
- **Data integrity + performance (Phase 5, mostly):** slot-capacity + past-date + duplicate guards (client + server), PNG→WebP diet (logos/nav ~4.1MB → ~405KB total; hero stays 319KB WebP, `fetchpriority="high"`, lazy below fold), archival job above.

## Ration Entitlement Rule

Single source of truth is `backend/services/rationCalculator.js` (`computeRationBreakdown`), shared by Terminal Hub, Family Profile, Booking, staff family dialog, and reports:

- **10 kg of food grains per household member per month**
- **Fixed minimum of 35 kg per household**, regardless of family size

So entitlement = `max(35, 10 × total members)` kg of food grains (rice / wheat / coarse grains, per depot stock). Only one item line is returned — PDS guarantees food grains only.

---

## Guideline Compliance — Are We According To The Guidelines Or Not?

Evaluated against `INDIAN_GOVT_WEBSITE_GUIDELINES.md` (GIGW 3.0 + DBIM 3.0). Summary: **foundations, accessibility, content, language, and staff-loop are largely compliant; identity/trust and security/launch are intentionally deferred** (personal project, no government submission yet). Details + evidence targets in `ROADMAP_GOVT_GRADE.md`.

| Pillar (guideline ref) | Similarity | Verdict |
|---|---|---|
| Status colours (DBIM §2, functional `#198754`/`#DC3545`/`#0D6EFD` by function, never colour-alone) | ~95% | ✅ Compliant — `STATUS` tokens in `swiss.jsx`, icon+text everywhere |
| Icons (DBIM §3 — one Lucide set, `title`+`aria-label` on icon-only, icon+label CTAs, no emoji) | ~90% | ✅ Compliant |
| Typography (DBIM §4 — self-hosted Noto Sans + Devanagari, `@theme` mapping, button scale, table alignment) | ~80% | ✅ Largely compliant |
| Imagery weight (GIGW Q6 — hero WebP 319KB, logos/nav WebP, lazy below-fold) | ~75% | ✅ Largely compliant |
| Accessibility (GIGW A-chapter / WCAG 2.1 AA — skip link, toolbar, focus, contrast, 200%/320px, print) | ~85% | ✅ Largely compliant — automated axe/ANDI scan still recommended |
| Content furniture (GIGW Q2/Q5/Q10/Q14/Q18 — footer, policies, Help, Sitemap/Search, last-updated, print) | ~90% | ✅ Largely compliant |
| Multilingual UI (GIGW Q13 — full EN/हिंदी chrome + bodies + console + policies, no layout loss) | ~80% | ✅ Largely compliant — screenshot archive still to do |
| Data & integrity (GIGW Q6/Q8 — shared quota rule, slot-capacity guard, archival job) | ~75% | ⚠️ Partial — avatar storage + load-test verification pending (see below) |
| Admin / staff side (product scope — roles matrix, slots, grievances, reports) | ~90%* | ✅ Core loop done — *per-shop scoping + staff-provisioning UI still pending |
| Identity & trust (Emblem Act 2005, DBIM §5, GIGW Q1/Q12 — Emblem/lockup, lineage, National Portal link, DigiLocker/Aadhaar/SSO) | ~30% | ⏸️ Deferred by design while personal (Phase 4 OPTIONAL) |
| Security & launch (GIGW S+L — HTTPS/HSTS/CSP, rate-limits, patch sweep, CERT-In audit, Safe-to-Host/CQW, monitoring/backups) | ~50% | ⏸️ Not compliant yet — required only before public hosting (Phase 6) |

What this means in practice: a citizen (Hindi or English, keyboard-only, 200% zoom) can register → complete profile → book a slot → file/track a grievance; a distributor can serve the queue and mark collections; an admin can configure slots/items/delivery, resolve grievances, and export district reports. What is **not** claimed: official-look certification, production security audit, or multi-district deployment — those are pending by choice, not oversight.

---

## What's Left To Do — Explicitly Not Finished

This project is **not complete**. Do not treat the table above as a completion certificate. Open items (in roadmap order):

- [ ] **Phase 4 — Identity & trust (OPTIONAL while personal):** Emblem-use authorisation → authorised lockup, lineage sentence, prominent `india.gov.in` link (new tab), DigiLocker/Aadhaar/SSO/MyScheme plan. Skip safely until government submission.
- [ ] **Phase 5.3 — Avatar storage:** move base64 avatars out of Mongo into object storage (S3-compatible/Cloudinary/GridFS + `avatarUrl` + backfill). Deferred; 1.5MB client + 2M-char server checks suffice for prototype.
- [ ] **Phase 5 verification — Performance proof:** k6/lighthouse pass (LCP < 2.5s throttled 4G, zero double-bookings under parallel requests).
- [ ] **Phase 6 — Security & launch readiness:** HTTPS+HSTS+CSP+secure cookies, rate-limit login/OTP/reset, patch sweep + dep cleanup, **CERT-In/STQC-empanelled audit → Safe-to-Host + CQW**, uptime/defacement monitoring, tested backups, published incident contacts, named WIM dashboard.
- [ ] **Per-shop scoping:** `centreId` on bookings/settings so distributor "own centre" is real multi-shop isolation (today singleton) + announcement model for the archival hook.
- [ ] **Staff-provisioning UI:** admin create/deactivate distributor accounts (backend flag exists, UI missing).
- [ ] **Final acceptance evidence:** `npm run build` + backend boot clean, full Hindi+English journeys recorded, contrast/keyboard/200%/320px/A4-print evidence archived in `/docs/evidence/`.

---

## Design System

- Noto Sans site-wide (self-hosted woff2, Devanagari fallback) — DBIM §4
- Tricolor (saffron / white / green) accent used sparingly as signature motif; light, high-contrast dashboard interior
- Swiss-grid dashboard components (buttons, cards, inputs, badges, avatars, stat blocks, tables) in shadcn-style language; status = green success / amber warning / red error / blue info, always icon + text
- Single Lucide icon set; square formal aesthetic, hairline borders over shadows

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Backend needs `.env` with `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and email credentials for OTP/notify. Frontend reads optional `VITE_API_URL`. See root `.env.example` for every variable.

> **Note:** Never commit `.env` files — they hold database credentials and API keys.

## Known Limitations (current scope)

- Single test district / singleton `DistributionSettings` — regional warehouse + collection centre are placeholder data, not live admin-managed multi-shop data yet.
- Profile pictures are base64 in MongoDB, not object storage — fine for prototype, not for scale (see 5.3 above).
- Grievance queue + reports currently run over shared data; true per-shop filtering waits on per-shop scoping.
- No Emblem/lockup, lineage sentence, or National Portal integration — deferred as a personal project (Phase 4).
- Dev-only security posture: no HTTPS/HSTS/CSP enforcement, no CERT-In audit / Safe-to-Host / CQW yet (Phase 6).
