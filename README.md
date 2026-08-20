# E-Ration Portal

A MERN-stack web application for a rural Public Distribution System (PDS) — the government scheme that distributes subsidized food grains to households through local ration shops. This build covers the **citizen-facing side**: registering, managing a household profile, and scheduling ration collection.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Lucide icons, Leaflet (maps), GSAP + SplitType (scroll animations)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI:** Google Gemini API, for grievance triage in the AI Help Desk
- **Auth:** JWT, with both email/password and phone-OTP login

## What's Built

### Landing Page
Public marketing page introducing the portal, with a GSAP/SplitType scroll-triggered typography animation and a tricolor accent motif.

### Authentication
- Register / log in with email and password
- Phone number + OTP login as an alternative
- JWT-based session handling

### Terminal Hub (Dashboard Home)
The citizen's main landing screen after login:
- Profile completion status, next collection date, and monthly quota at a glance
- A live map (Leaflet + OpenStreetMap) showing the delivery route from the regional warehouse to the citizen's assigned local distributor
- Household registry summary and collection appointment summary, each with a quick action to manage further
- A persistent account chip (name, profile picture, ration card number) shown in the same place on every page

### Family Profile
- **Account details:** name, profile picture upload, registered phone/email (read-only, since it's tied to login)
- **Ration card details:** card ID and head of family
- **Address / location:** village, tehsil, district, state, PIN code — this determines which local distributor a household is assigned to
- **Family members:** add, edit, or remove household members inline; each member's relation to the head of family is freely typed rather than picked from a fixed list
- A live estimate of the household's monthly ration, calculated the same way as the Terminal Hub

### Ration Bookings
Schedule a distribution collection slot (date + time window) at the assigned distributor, with the household's monthly quota allocation shown alongside.

### AI Help Desk
Citizens can describe an issue in plain language; Gemini triages it into a category, translated summary, and recommended action for follow-up.

## Ration Entitlement Rule

The quota calculation follows the actual PDS rule rather than an invented one:

- **5 kg of food grains per household member per month**
- **A fixed minimum of 35 kg per household**, regardless of family size

So a household's monthly entitlement is `max(35, 5 × total members)` kg of food grains (rice / wheat / coarse grains, per depot stock). This single rule is shared across the Terminal Hub, Family Profile, and Ration Bookings pages so the number is always consistent.

## Design System

- Cabinet Grotesk as the site-wide typeface
- A tricolor (saffron / white / green) accent used sparingly as a signature motif, echoing the landing page across the otherwise light, high-contrast dashboard interior
- Dashboard UI components (buttons, cards, inputs, badges, avatars) built in a shadcn/ui-style visual language for a clean, consistent look


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

Both need a `.env` file in `backend/` with `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and email credentials for OTP delivery.

## Known Limitations (current scope)

- The regional warehouse and local distributor locations are placeholder data (one test district configured) rather than live, admin-managed data
- Profile pictures are stored as base64 in MongoDB rather than a dedicated file storage service — fine for a prototype, not recommended at scale