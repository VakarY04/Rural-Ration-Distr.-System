// ── E-Ration Citizen Navigation Icons (custom, single set) ───────────────────
// DBIM §3.3 / GIGW A1–A6 compliant replacement for the previous mixed .webp +
// Lucide navigation imagery:
//
//   · ONE consistent line style across all four items (plus logout) — 24×24
//     grid, 1.8px stroke, square caps/joins, geometric formal construction.
//   · `stroke="currentColor"` so the glyph inherits the button text colour and
//     never carries meaning by colour alone — every button keeps its text
//     label (icon + label) plus `aria-current` / `aria-label` handling in
//     DashboardShell. Decorative here: `aria-hidden="true"` on the <svg>.
//   · Square, hairline government aesthetic — no rounded flair, no emoji, no
//     filled pictograms. Touch target stays on the button (44px+), not the glyph.
function IconBase({ size = 26, className = '', children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      {...rest}
    >
      {children}
    </svg>
  );
}

// Terminal hub — department service window: framed screen with header rule and
// a 2-pane operational grid (counter / ledger). Square construction throughout.
export function TerminalHubIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <rect x="5.2" y="5.8" width="1.7" height="1.7" />
      <line x1="12" y1="9" x2="12" y2="20" />
      <line x1="12" y1="14.5" x2="21" y2="14.5" />
    </IconBase>
  );
}

// Family profile — household registry: front citizen record with a second
// dependent record set behind. Heads stay circular (human), everything else is
// square-cut hairline so the set matches the terminal geometry.
export function FamilyProfileIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="10" cy="8" r="3.2" />
      <path d="M4.5 19.5c0-3.2 2.5-5.2 5.5-5.2s5.5 2 5.5 5.2" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.8 14.6c2.7 0.2 4.7 2 4.7 4.9" />
    </IconBase>
  );
}

// Ration bookings — sealed grain sack with a wheat ear, plus a booking ledger
// badge (square docket + confirm tick) docked at the corner. Reads as
// "allotted stock + reserved slot" without any colour cue.
export function RationBookingsIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9.5 8c0-2 1-2.6 1-4h3c0 1.4 1 2 1 4" />
      <line x1="8.4" y1="8" x2="15.6" y2="8" />
      <path d="M8 8h8l1.2 7.2h-10.4L8 8z" />
      <line x1="12" y1="10.8" x2="12" y2="13.8" />
      <path d="M12 12.2l-1.8-1.3M12 12.2l1.8-1.3M12 13.8l-1.8-1.3M12 13.8l1.8-1.3" />
      <rect x="14.5" y="14.5" width="6" height="6" fill="none" />
      <path d="M16 17.5l1.2 1.2 2-2.2" />
    </IconBase>
  );
}

// AI help desk — square government service bubble (formal, not rounded chat)
// carrying a help mark. The tail anchors it as a service counter dialogue.
export function AiHelpDeskIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4" width="17" height="12.5" />
      <path d="M8 16.5v3.5l3.5-3.5" />
      <path d="M10.2 10.4c0-1.5 0.8-2.4 1.8-2.4s1.8 0.9 1.8 2c0 1.5-1.8 1.7-1.8 3.1" />
      <line x1="12" y1="13.4" x2="12" y2="13.5" />
    </IconBase>
  );
}

// Log out — same hairline square language: doorway frame + exit arrow. Used in
// the nav panel so logout does not introduce a second (Lucide) icon set.
export function GovLogoutIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4" width="11" height="16" />
      <line x1="14.5" y1="12" x2="21" y2="12" />
      <path d="M18.2 9.2L21 12l-2.8 2.8" />
    </IconBase>
  );
}
