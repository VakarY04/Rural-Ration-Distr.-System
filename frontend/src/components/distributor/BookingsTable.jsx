// Booked families queue — Swiss index list showing only each family's
// head of household, numbered like a ledger register. Families are
// deduplicated by their unique ration card number so the same card never
// appears twice, while two different cards that happen to share a family
// name are both retained.
//
// Each row shows the live booking status (visible to every role, including
// read-only admins) plus, for distributors only, a "family has taken the
// ration" action that marks the booking Collected.
import { MapPin, Eye, CheckCircle2, Undo2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

function statusStyle(status) {
  if (status === 'Collected') return 'border-[#198754]/40 bg-[#198754]/10 text-[#198754]';
  if (status === 'Confirmed') return 'border-[#0D6EFD]/30 bg-[#0D6EFD]/10 text-[#0D6EFD]';
  return 'border-slate-300 bg-slate-50 text-slate-500';
}

export default function BookingsTable({ bookings, onView, canMarkCollected = false, markingId = '', onMarkCollected, onUnmarkCollected }) {
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
      {unique.map((b, i) => {
        const collected = b.status === 'Collected';
        const marking = markingId !== '' && markingId === b.id;
        return (
          <li
            key={b.rationCardNumber || b.id}
            className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors flex-wrap"
          >
            <span className="text-[11px] font-bold text-slate-500 tabular-nums w-6 shrink-0" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="w-7 h-7 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0" title={t('queue.locationTitle')} aria-hidden="true">
              <MapPin size={13} />
            </span>
            <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{b.headOfFamily}</span>
            {b.status && (
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${statusStyle(b.status)}`}>
                {b.status}
              </span>
            )}
            <button
              type="button"
              onClick={() => onView?.(b)}
              title={t('queue.viewTitle')}
              className="shrink-0 text-xs font-semibold tracking-wide px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 inline-flex items-center gap-1.5"
            >
              <Eye size={12} aria-hidden="true" />
              {t('queue.view')}
            </button>
            {canMarkCollected && !collected && (
              <button
                type="button"
                onClick={() => onMarkCollected?.(b)}
                disabled={marking}
                title={t('queue.markTitle')}
                aria-label={t('queue.markTitle')}
                className="shrink-0 text-xs font-semibold tracking-wide px-3 py-1.5 rounded bg-[#198754] hover:bg-[#157347] text-white transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#198754] inline-flex items-center gap-1.5"
              >
                {marking ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={12} aria-hidden="true" />}
                {marking ? t('queue.marking') : t('queue.markCollected')}
              </button>
            )}
            {canMarkCollected && collected && (
              <button
                type="button"
                onClick={() => onUnmarkCollected?.(b)}
                disabled={marking}
                title={t('queue.unmarkTitle')}
                aria-label={t('queue.unmarkTitle')}
                className="shrink-0 text-xs font-semibold tracking-wide px-3 py-1.5 rounded border border-amber-400 text-amber-700 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 inline-flex items-center gap-1.5"
              >
                {marking ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Undo2 size={12} aria-hidden="true" />}
                {marking ? t('queue.unmarking') : t('queue.unmark')}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
