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

export const swiss = {
  page: 'min-h-screen font-sans bg-[#F4F6F9] text-[#000080]',
  panel: 'bg-white border border-slate-200/80 rounded-3xl',
  input:
    'w-full border border-slate-200 focus:border-[#000080] hover:border-slate-400 hover:shadow-md bg-slate-50 focus:bg-white hover:bg-white px-3 py-2 text-sm font-medium text-[#000080] outline-none transition-all duration-200 placeholder:text-slate-400',
  btnPrimary:
    'bg-[#FF9933] hover:bg-[#e68a00] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933] inline-flex items-center justify-center gap-2',
  btnSecondary:
    'border border-slate-300 hover:border-[#000080] text-[#000080] hover:text-white hover:bg-[#000080] text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933] inline-flex items-center justify-center gap-2 bg-white',
  label: 'text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 block mb-1.5',
  micro: 'text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400',
  sectionTitle: 'text-sm font-bold uppercase tracking-[0.1em] text-[#000080]',
  headline: 'text-3xl md:text-5xl font-extrabold tracking-tighter text-[#000080]',
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
