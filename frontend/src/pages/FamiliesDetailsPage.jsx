import { Users } from 'lucide-react';
import { swiss } from '../components/ui/swiss';
import BookingsTable from '../components/distributor/BookingsTable';
import { useLanguage } from '../i18n/LanguageContext';

// Minimal Families Details view — surfaces the unique booked families pulled
// from the shared distributor summary. Full family management is out of scope
// for this navigation step.
export default function FamiliesDetailsPage({ bookings }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('families.eyebrow')}</p>
        <h1 className={`${swiss.headline} flex items-center gap-2.5`}>
          <span className="w-9 h-9 border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center shrink-0" aria-hidden="true">
            <Users size={17} />
          </span>
          {t('families.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          {t('families.intro')}
        </p>
      </header>

      <section aria-label={t('families.booked')} className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className={swiss.sectionTitle}>{t('families.booked')}</h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 tabular-nums">
            {t('families.recent', { count: bookings.length })}
          </span>
        </div>
        <BookingsTable bookings={bookings} />
      </section>
    </div>
  );
}
