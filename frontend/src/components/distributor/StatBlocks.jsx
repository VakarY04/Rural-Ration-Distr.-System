// Swiss-style headline statistics: oversized tabular numerals, hairline
// dividers and a single saffron marker per block — no card chrome.
import { Users, Wheat } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function StatBlocks({ stats }) {
  const { t } = useLanguage();
  const committed = Array.isArray(stats?.committedItems) ? stats.committedItems.filter((r) => r && String(r.label || '').trim()) : [];
  // Storage labels stay English; known PDS staples render translated.
  const itemName = (label) => {
    const map = {
      rice: 'items.nameRice',
      wheat: 'items.nameWheat',
      oil: 'items.nameOil',
      sugar: 'items.nameSugar',
      salt: 'items.nameSalt',
      pulses: 'items.namePulses',
      pulse: 'items.namePulses',
      dal: 'items.namePulses',
      kerosene: 'items.nameKerosene',
      'coarse grain': 'items.nameCoarseGrain',
      coarsegrain: 'items.nameCoarseGrain',
      millet: 'items.nameCoarseGrain',
      millets: 'items.nameCoarseGrain',
    };
    const key = map[String(label || '').trim().toLowerCase()];
    return key ? t(key) : String(label || '');
  };
  const unitLabel = (unit) => (unit === 'litre' ? t('items.litre') : t('items.kg'));
  return (
    <section
      aria-label={t('stats.label')}
      className="grid grid-cols-2 border-t border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900"
    >
      <article className="p-6 flex flex-col gap-3">
        <span className="block w-6 h-[3px] bg-orange-500" aria-hidden="true" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 break-words"><Users size={12} aria-hidden="true" /> {t('stats.families')}</p>
        </div>
        <p className="text-5xl leading-none font-extrabold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {stats?.familiesBooked ?? 0}
        </p>
      </article>
      <article className="p-6 flex flex-col gap-3 min-w-0">
        <span className="block w-6 h-[3px] bg-orange-500" aria-hidden="true" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 break-words"><Wheat size={12} aria-hidden="true" /> {t('stats.grain')}</p>
        </div>
        {committed.length === 0 ? (
          <p className="text-5xl leading-none font-extrabold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {stats?.grainCommittedKg ?? 0}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {committed.map((row, i) => (
              <li key={`${row.label}-${i}`} className="flex items-baseline justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{itemName(row.label)}</span>
                <span className="text-lg font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 shrink-0">
                  {row.quantity} {unitLabel(row.unit)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
