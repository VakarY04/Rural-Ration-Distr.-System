import { Wheat, Scale, FileCheck, Calendar, Clock } from 'lucide-react';
import { swiss, SectionHead } from '../../components/ui/swiss';
import { useLanguage } from '../../i18n/LanguageContext';

export function QuotaPanel({ memberCount, totalQuota }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0" aria-hidden="true">
            <FileCheck size={15} />
          </span>
          <SectionHead title={t('booking.quota.title')} />
        </div>
        <p className="text-[11px] text-slate-500 font-medium tabular-nums">
          {t('booking.quota.members', { count: memberCount })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-slate-200 p-4 flex items-center gap-3.5 bg-slate-50">
          <div className="w-10 h-10 bg-white border border-slate-300 text-orange-600 flex items-center justify-center shrink-0">
            <Wheat size={20} />
          </div>
          <div>
            <p className={swiss.micro}>{t('booking.quota.guaranteed')}</p>
            <p className="text-xl font-extrabold tracking-tight text-slate-900 tabular-nums">{totalQuota} kg</p>
          </div>
        </div>

        <div className="border border-slate-200 p-4 flex items-center gap-3.5 bg-slate-50">
          <div className="w-10 h-10 bg-white border border-slate-300 text-slate-900 flex items-center justify-center shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <p className={swiss.micro}>{t('booking.quota.rate')}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5 tabular-nums">{t('booking.quota.rateValue')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActiveBookingTicket({ bookingDetails, headOfFamily }) {
  const { t } = useLanguage();
  return (
    <section className={`${swiss.panel} p-6 space-y-4`}>
      <SectionHead
        title={t('booking.ticket.title')}
        right={
          <span className="bg-[#198754] text-white text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider tabular-nums">
            {bookingDetails.status || t('booking.ticket.confirmed')}
          </span>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200 text-xs">
        <div className="bg-white p-3">
          <p className={swiss.micro}><span className="flex items-center gap-1"><Calendar size={11} aria-hidden="true" /> {t('booking.ticket.date')}</span></p>
          <p className="font-bold text-slate-900 mt-0.5 tabular-nums">{bookingDetails.distributionDate}</p>
        </div>
        <div className="bg-white p-3">
          <p className={swiss.micro}><span className="flex items-center gap-1"><Clock size={11} aria-hidden="true" /> {t('booking.ticket.window')}</span></p>
          <p className="font-bold text-slate-900 mt-0.5 tabular-nums">{bookingDetails.timeSlot}</p>
        </div>
        <div className="bg-white p-3">
          <p className={swiss.micro}>{t('booking.ticket.holder')}</p>
          <p className="font-bold text-slate-900 mt-0.5">{headOfFamily}</p>
        </div>
      </div>
    </section>
  );
}
