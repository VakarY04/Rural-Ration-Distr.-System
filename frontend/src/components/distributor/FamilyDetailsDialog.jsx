import { useEffect, useRef } from 'react';
import { X, Users, Wheat, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// Family details dialog — shows the household record exactly as entered in
// the citizen's Family Profile (members with name / age, address)
// plus the computed ration entitlement for that household. Shared by the
// Families Details page and the Home booking queue, for admins and
// distributors alike.
export default function FamilyDetailsDialog({ details, loading, error, onClose }) {
  const { t } = useLanguage();
  const closeRef = useRef(null);
  // Backend stores booking status in English — map to the active language so
  // Hindi mode never shows a raw English status word.
  const bookingStatusLabel = (status) => {
    if (/^collected$/i.test(String(status || ''))) return t('status.collected');
    if (/^confirmed$/i.test(String(status || ''))) return t('status.confirmed');
    return String(status || '');
  };

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const address = details?.address;
  const addressLine = address
    ? [address.village, address.block, address.district, address.state, address.pincode]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('families.details.title')}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {t('families.details.eyebrow')}
            </p>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 truncate">
              {details?.headOfFamily || t('families.details.title')}
            </h2>
            {details?.rationCardNumber && (
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-0.5 tabular-nums">
                {t('families.details.card', { id: details.rationCardNumber })}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('families.details.close')}
            className={`shrink-0 p-2 border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-600 transition-colors cursor-pointer ${FOCUS}`}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <p className="py-10 text-center text-sm font-semibold text-slate-500 inline-flex items-center gap-2 w-full justify-center">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {t('families.details.loading')}
            </p>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 text-sm font-medium text-[#DC3545] bg-[#DC3545]/10 border border-[#DC3545]/30 p-4">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && details && (
            <>
              {/* Household identity */}
              <section className="space-y-2 text-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {t('families.details.household')}
                </h3>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{t('families.details.head')}</span>
                  <span className="font-semibold text-slate-800 text-right">{details.headOfFamily}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{t('families.details.membersCount')}</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {t('families.details.memberCount', { count: details.totalMembers })}
                  </span>
                </div>
                {addressLine && (
                  <div className="flex justify-between gap-6 py-1.5">
                    <span className="text-slate-500 shrink-0">{t('families.details.address')}</span>
                    <span className="font-semibold text-slate-800 text-right">{addressLine}</span>
                  </div>
                )}
              </section>

              {/* Family members as in the citizen's profile */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-1.5">
                  <Users size={13} aria-hidden="true" />
                  {t('families.details.membersTitle', { count: details.members?.length || 0 })}
                </h3>
                {details.members?.length ? (
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-10">#</th>
                        <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2">{t('families.details.name')}</th>
                        <th scope="col" className="text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-16">{t('families.details.age')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.members.map((m, i) => (
                        <tr key={`${m.name}-${i}`} className="border-t border-slate-100">
                          <td className="py-2 pr-3 text-xs font-bold text-slate-400 tabular-nums">{i + 1}</td>
                          <td className="py-2 pr-3 text-sm font-semibold text-slate-900">{m.name}</td>
                          <td className="py-2 pr-3 text-sm font-bold text-slate-900 tabular-nums text-right">{m.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-slate-500">{t('families.details.noMembers')}</p>
                )}
              </section>

              {/* Ration entitlement for this household */}
              <section className="border border-[#198754]/30 bg-[#198754]/5 p-5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#198754] flex items-center gap-1.5">
                  <Wheat size={13} aria-hidden="true" />
                  {t('families.details.rationTitle')}
                </h3>
                <p className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
                  {details.ration?.totalKg}
                  <span className="text-lg font-bold text-slate-500 ml-1">kg</span>
                </p>
                {(details.ration?.items || []).map((item) => (
                  <p key={item.key || item.label} className="text-sm text-slate-700">
                    <span className="font-semibold">{item.label}</span>
                    {' — '}
                    <span className="font-extrabold tabular-nums">{item.quantity} {item.unit}</span>
                  </p>
                ))}
                <p className="text-[11px] text-slate-500">{t('families.details.rationRule')}</p>
              </section>

              {/* Latest booking, if any */}
              <section className="space-y-2 text-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} aria-hidden="true" />
                  {t('families.details.bookingTitle')}
                </h3>
                {details.booking ? (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">{t('families.details.date')}</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{details.booking.distributionDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">{t('families.details.slot')}</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{details.booking.timeSlot}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">{t('families.details.status')}</span>
                      <span className="font-semibold text-slate-800">{bookingStatusLabel(details.booking.status)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{t('families.details.noBooking')}</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
