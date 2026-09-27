// Booked families queue — Swiss index list showing only each family's
// head of household, numbered like a ledger register. Families are
// deduplicated by their unique ration card number so the same card never
// appears twice, while two different cards that happen to share a family
// name are both retained.
import { MapPin, Eye } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
export default function BookingsTable({ bookings, onView }) {
  const { t } = useLanguage();
  if (!bookings?.length) {
    return (
      <div className="border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-900 break-words">{t('queue.empty')}</p>
        <p className="text-xs text-slate-500 mt-1 break-words">{t('queue.emptyBody')}</p>
      </div>
    );
  }

  // Deduplicate by ration card number, preserving first-seen order.
  const seen = new Set();
  const unique = [];
  for (const b of bookings) {
    const key = b.rationCardNumber || b.id;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(b);
  }

  return (
    <ol className="border border-slate-200 bg-white divide-y divide-slate-100" aria-label={t('queue.label')}>
      {unique.map((b, i) => (
        <li
          key={b.rationCardNumber || b.id}
          className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-500 tabular-nums w-6 shrink-0" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="w-7 h-7 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0" title={t('queue.locationTitle')} aria-hidden="true">
            <MapPin size={13} />
          </span>
          <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{b.headOfFamily}</span>
          <button
            type="button"
            onClick={() => onView?.(b)}
            title={t('queue.viewTitle')}
            className="shrink-0 text-xs font-semibold tracking-wide px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 inline-flex items-center gap-1.5"
          >
            <Eye size={12} aria-hidden="true" />
            {t('queue.view')}
          </button>
        </li>
      ))}
    </ol>
  );
}
