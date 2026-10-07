/* eslint-disable react-refresh/only-export-components */

// ── E-Ration Design Language ────────────────────────────────────────────────
// Minimalism × Swiss Design × Indian Government colour palette.
//
// One source of truth for the visual system so every page stays identical:
//   · Square corners everywhere (rounded-none) — no soft card chrome
//   · Hairline borders instead of shadows
//   · Oversized tight-tracked headings + uppercase micro-labels
//   · Indian Govt palette:
//     – Saffron #FF9933  (primary accent / CTAs)
//     – India Green #138808 (success / secondary accent)
//     – Navy Blue #000080 (text / dark surfaces)
//     – White #FFFFFF (backgrounds / contrast)
//   · Tricolor signature strip at the top of every full-page layout
//   · Visible focus rings on every interactive element (GIGW accessibility)

export const SAFFRON = '#FF9933';
export const INDIA_GREEN = '#138808';
export const NAVY = '#000080';
export const TRICOLOR_GRADIENT = `linear-gradient(90deg, ${SAFFRON} 0%, #FFFFFF 50%, ${INDIA_GREEN} 100%)`;

// DBIM functional status palette — use strictly by function, never as decoration:
// success → Liberty Green, error → Coral Red, info/hyperlink → Blue.
export const STATUS = {
  success: '#198754',
  successHover: '#157347',
  error: '#DC3545',
  errorHover: '#B02A37',
  info: '#0D6EFD',
  infoHover: '#0B5ED7',
};

// Dark-mode surface system (class `dark` on <html>, user-persisted):
// page → deep navy-slate, cards → slate-900, inputs → slate-800, hairlines →
// slate-700, body copy → slate-100, navy brand text → periwinkle #B9C8FF
// (≈10:1 on slate-900, keeps the gov identity after dark). Saffron/green
// action fills stay identical so CTAs read the same in both themes.
export const swiss = {
  page: 'min-h-screen font-sans bg-[#F4F6F9] text-[#000080] dark:bg-slate-950 dark:text-slate-100',
  panel: 'bg-white border border-slate-200/80 rounded-xl dark:bg-slate-900 dark:border-slate-700',
  input:
    'w-full border border-slate-200 focus:border-[#000080] hover:border-slate-400 hover:shadow-md bg-slate-50 focus:bg-white hover:bg-white px-3 py-2 text-sm font-medium text-[#000080] outline-none transition-all duration-200 placeholder:text-slate-500 dark:border-slate-700 dark:focus:border-[#B9C8FF] dark:hover:border-slate-500 dark:bg-slate-800 dark:focus:bg-slate-800 dark:hover:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:hover:shadow-none',
  btnPrimary:
    'bg-[#FF9933] hover:bg-[#e68a00] text-white text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933] inline-flex items-center justify-center gap-2',
  btnSecondary:
    'border border-slate-300 hover:border-[#000080] text-[#000080] hover:text-white hover:bg-[#000080] text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933] inline-flex items-center justify-center gap-2 bg-white dark:border-slate-600 dark:text-slate-100 dark:bg-slate-900 dark:hover:border-slate-200 dark:hover:bg-slate-200 dark:hover:text-slate-900',
  label: 'text-sm font-medium tracking-wide text-slate-500 block mb-1.5 dark:text-slate-400',
  micro: 'text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400',
  sectionTitle: 'text-base md:text-xl font-medium tracking-tight text-[#000080] dark:text-[#B9C8FF]',
  headline: 'text-2xl md:text-4xl font-bold tracking-tighter text-[#000080] dark:text-[#B9C8FF]',
};

export function TricolorStrip({ className = 'h-1' }) {
  return <div className={`${className} w-full`} style={{ background: TRICOLOR_GRADIENT }} aria-hidden="true" />;
}

export function SectionHead({ title, right }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className={swiss.sectionTitle}>{title}</h2>
      {right}
    </div>
  );
}

// ── Users (citizen) section variant ─────────────────────────────────────────
// Same system as `swiss`, except navy body text renders black per owner
// request. Citizen files import `swissUser as swiss` / `SectionHeadUser as
// SectionHead` so usage sites stay identical. Staff console, auth, landing
// and info pages keep importing `swiss` / `SectionHead` (navy) unchanged.
// Functional status colours (STATUS green/red/info-blue) are untouched in
// both variants — they carry meaning, not body copy.
export const swissUser = {
  ...swiss,
  page: 'min-h-screen font-sans bg-[#F4F6F9] text-black dark:bg-slate-950 dark:text-slate-100',
  input:
    'w-full border border-slate-200 focus:border-black hover:border-slate-400 hover:shadow-md bg-slate-50 focus:bg-white hover:bg-white px-3 py-2 text-sm font-medium text-black outline-none transition-all duration-200 placeholder:text-slate-500 dark:border-slate-700 dark:focus:border-slate-300 dark:hover:border-slate-500 dark:bg-slate-800 dark:focus:bg-slate-800 dark:hover:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:hover:shadow-none',
  btnSecondary:
    'border border-slate-300 hover:border-black text-black hover:text-white hover:bg-black text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933] inline-flex items-center justify-center gap-2 bg-white dark:border-slate-600 dark:text-slate-100 dark:bg-slate-900 dark:hover:border-slate-200 dark:hover:bg-slate-200 dark:hover:text-slate-900',
  sectionTitle: 'text-base md:text-xl font-medium tracking-tight text-black dark:text-slate-100',
  headline: 'text-2xl md:text-4xl font-bold tracking-tighter text-black dark:text-slate-100',
};

export function SectionHeadUser({ title, right }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className={swissUser.sectionTitle}>{title}</h2>
      {right}
    </div>
  );
}
