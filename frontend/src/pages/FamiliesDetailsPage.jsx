import { Users } from 'lucide-react';
import { swissUser as swiss } from '../components/ui/swiss';
import BookingsTable from '../components/distributor/BookingsTable';
import { useLanguage } from '../i18n/LanguageContext';

// Families Details view — unique booked families from the shared distributor
// summary. "View" opens the household record (members as entered in the
// citizen's Family Profile + computed ration entitlement) via the `onView`
// handler owned by the console. Distributors additionally get the
// "family has taken the ration" action; admins see the resulting status
// read-only.
export default function FamiliesDetailsPage({ bookings, onView, canMarkCollected = false, markingId = '', onMarkCollected, onUnmarkCollected }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('families.eyebrow')}</p>
        <h1 className={`${swiss.headline} flex items-center gap-2.5`}>
            <span className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0" aria-hidden="true">
            <Users size={17} />
          </span>
          {t('families.title')}
        </h1>
      </header>

      <section aria-label={t('families.booked')} className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className={swiss.sectionTitle}>{t('families.booked')}</h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 tabular-nums">
            {t('families.recent', { count: bookings.length })}
          </span>
        </div>
        <BookingsTable
          bookings={bookings}
          onView={onView}
          canMarkCollected={canMarkCollected}
          markingId={markingId}
          onMarkCollected={onMarkCollected}
          onUnmarkCollected={onUnmarkCollected}
        />
      </section>
    </div>
  );
}
