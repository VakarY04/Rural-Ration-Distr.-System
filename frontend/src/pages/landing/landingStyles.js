// ── Landing card styling contract ────────────────────────────────────────────
// Every landing card is rendered as two nested layers:
//   <shell>  → carries the hover transform + box-shadow (NOT the card itself,
//              because GSAP writes an inline transform on .feature-card-box /
//              .hero-badge-box for the scroll-in animation and would otherwise
//              override a CSS :hover transform on the card)
//   <card>   → cardBase / badgeBase (the visible rounded surface)
//
// ROOT-CAUSE RULE for the corner-gap bug: the shell MUST mirror the card's
// border-radius AND keep `overflow-hidden` + the same background colour. If the
// shell stays square while the card is rounded, the card's rounded corners leave
// triangular notches inside the square shell, exposing the dark page background
// (and the shell's square box-shadow makes it obvious on hover). Keep radii in
// sync: all landing cards use rounded-2xl (feature cards, hero badges, banner).
//
// Inner overlays (e.g. <WaveAccent>) are absolutely positioned and rely solely
// on the card's `overflow-hidden` to clip to the rounded corners. Any future
// inner gradient/image/::before/::after MUST either inherit the parent radius or
// be explicitly rounded to match, and must never extend past the card's clip.
// ────────────────────────────────────────────────────────────────────────────
export const cardBase =
  'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-10 flex flex-col justify-between transition-colors duration-300 group-hover:border-slate-400 text-left cursor-default relative overflow-hidden h-full';

export const badgeBase =
  'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 rounded-2xl px-5 py-4 flex items-center gap-4 h-full text-left transition-colors duration-300 group-hover:border-slate-400 cursor-default relative overflow-hidden';

// Shared hover "shells" — MUST keep the radius / overflow / background noted in
// the contract above so the rounded card and its hover shadow clip as one shape.
export const portalCardShell =
  'group origin-top flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-400/40';
export const heroBadgeShell =
  'group flex flex-col rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-300/60';
export const bannerShell =
  'rounded-2xl overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto';

// DOM class hooks. These strings are shared by LandingPage (as element class
// names) and useLandingAnimations (as GSAP ScrollTrigger query selectors) so the
// two files can never drift out of sync.
export const HERO_BADGES_CONTAINER = 'hero-badges-container';
export const FEATURE_CARDS_GRID = 'feature-cards-grid';
export const HERO_BADGE_BOX = 'hero-badge-box';
export const HERO_BADGE_TITLE = 'hero-badge-title';
export const FEATURE_CARD_BOX = 'feature-card-box';
export const FEATURE_CARD_HEADING = 'feature-card-heading';
export const FEATURE_CARD_TEXT = 'feature-card-text';
export const TRUST_FOOTER_BOX = 'trust-footer-box';
export const TRUST_FOOTER_TEXT = 'trust-footer-text';
