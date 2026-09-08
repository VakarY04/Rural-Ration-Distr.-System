// Swiss-style headline statistics: oversized tabular numerals, hairline
// dividers and a single saffron marker per block — no card chrome.
import { Users, Wheat } from 'lucide-react';

const BLOCKS = [
  { key: 'familiesBooked', label: 'Families booked', icon: Users },
  { key: 'grainCommittedKg', label: 'Grain committed (kg)', icon: Wheat },
];

export default function StatBlocks({ stats }) {
  return (
    <section
      aria-label="Distribution statistics"
      className="grid grid-cols-2 border-t border-b border-slate-200 divide-x divide-slate-200 bg-white"
    >
      {BLOCKS.map(({ key, label, icon: Icon }) => (
        <article key={key} className="p-6 flex flex-col gap-3">
          <span className="block w-6 h-[3px] bg-orange-500" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-1.5"><Icon size={12} aria-hidden="true" /> {label}</p>
          </div>
          <p className="text-5xl leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">
            {stats?.[key] ?? 0}
          </p>
        </article>
      ))}
    </section>
  );
}
