import { useState, useEffect } from 'react';
import {
  AlertCircle, AlertTriangle, ArrowRight, Calendar, Clock, Bell, MapPin, Users,
  ShoppingBag, Building2,
} from 'lucide-react';
import DeliveryRouteMap from '../components/DeliveryRouteMap';
import { API_URL } from '../services/api';
import { swissUser as swiss, SectionHeadUser as SectionHead } from '../components/ui/swiss';
import { useLanguage } from '../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

const chip = 'inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider';

function IconChip({ icon: Icon, tone }) {
  const palette = {
    green: 'border-[#198754]/30 bg-[#198754]/10 text-[#198754]',
    blue: 'border-[#0D6EFD]/30 bg-[#0D6EFD]/10 text-[#0D6EFD]',
    orange: 'border-orange-200 bg-orange-50 text-orange-600',
    amber: 'border-amber-200 bg-amber-50 text-amber-600',
  };
  return (
    <div className={`w-11 h-11 border flex items-center justify-center shrink-0 ${palette[tone]}`}>
      <Icon size={20} />
    </div>
  );
}

export default function DashboardHome({ onNavigate }) {
  const { t, lang } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ration_user_token');
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    fetch(API_URL + '/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => setSummary(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <p className={swiss.micro}>{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center text-sm font-medium text-slate-500">
        {t('dashboard.loadFailed')}
      </div>
    );
  }

  const { name, profile, booking, ration, delivery } = summary;
  const hasProfile = Boolean(profile);

  // Missed pickup: the (fixed or chosen) collection date has passed and the
  // distributor never marked the booking Collected — i.e. the user forgot to
  // pick up the ration. Policy: the ration is made available in the next
  // distribution window when it opens. Date-only comparison in local time so
  // a same-day evening slot is not flagged prematurely.
  const parseDateOnly = (value) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const isCollected = /^collected$/i.test(String(booking?.status || ''));
  const bookingDate = parseDateOnly(booking?.distributionDate);
  const isMissed = Boolean(
    booking && !isCollected && bookingDate && (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate < today;
    })()
  );
  const missedDateLabel = bookingDate
    ? bookingDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : (booking?.distributionDate || '');

  // Backend stores booking status in English — render the active-language
  // label so Hindi mode never shows a raw English status word.
  const bookingStatusLabel = (status) => {
    if (/^collected$/i.test(String(status || ''))) return t('status.collected');
    if (/^confirmed$/i.test(String(status || ''))) return t('status.confirmed');
    return String(status || '');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('dashboard.greeting', { name })}</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className={swiss.headline}>{t('dashboard.title')}</h1>
        </div>
        {summary.updatedAt && (
          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            {t('dashboard.lastReviewed', { date: new Date(summary.updatedAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })}
          </p>
        )}
      </header>

      <section className={`${swiss.panel} grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200`}>
        <div className="p-6 min-w-0 overflow-hidden">
          <p className={swiss.micro}>{t('dashboard.profileStatus')}</p>
          <p className={`mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums break-words ${hasProfile ? 'text-[#198754]' : 'text-amber-600'}`}>
            {hasProfile ? t('dashboard.complete') : t('dashboard.incomplete')}
          </p>
          <p className="text-xs text-slate-500 mt-1">{hasProfile ? t('dashboard.upToDate') : t('dashboard.missing')}</p>
        </div>
        <div className="p-6 min-w-0 overflow-hidden">
          <p className={swiss.micro}>{t('dashboard.nextCollection')}</p>
          <p className={`mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums break-words ${!booking ? 'text-slate-500' : isMissed ? 'text-[#DC3545]' : 'text-slate-900'}`}>
            {booking ? booking.distributionDate : t('dashboard.notScheduled')}
          </p>
          <p className={`text-xs mt-1 ${isMissed ? 'font-bold text-[#DC3545]' : 'text-slate-500'}`}>{booking ? (isMissed ? t('dashboard.missedTitle') : booking.timeSlot) : t('dashboard.bookHint')}</p>
        </div>
        <div className="p-6 min-w-0 overflow-hidden flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className={swiss.micro}>{t('dashboard.monthlyQuota')}</p>
            <p className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight tabular-nums text-slate-900 break-words">
              {ration.totalKg}
              <span className="text-lg font-bold text-slate-500 ml-1">kg</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('dashboard.totalEntitlement')}</p>
          </div>
          <IconChip icon={ShoppingBag} tone="orange" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-stretch">
        <div className={`${swiss.panel} overflow-hidden h-[360px]`} title={t('dashboard.mapTitle')}>
          <DeliveryRouteMap origin={delivery.from} destination={delivery.to} />
        </div>

        <div className="space-y-4">
          <div className={`${swiss.panel} p-5`}>
            <SectionHead title={t('dashboard.deliveryDetails')} />
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{t('dashboard.fromWarehouse')}</p>
                <div className="mt-1.5 flex items-start gap-2">
                  <MapPin size={14} className="text-orange-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{delivery.from.label}</p>
                    <p className="text-xs text-slate-500 leading-snug">{delivery.from.address}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{t('dashboard.toCentre')}</p>
                <div className="mt-1.5 flex items-start gap-2">
                  <MapPin size={14} className="text-orange-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{delivery.to.label}</p>
                    <p className="text-xs text-slate-500 leading-snug">{delivery.to.address}</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              {t('dashboard.assignedNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${swiss.panel} p-6 space-y-4`}>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center shrink-0" aria-hidden="true">
              <Users size={15} />
            </span>
            <SectionHead title={t('dashboard.householdProfile')} />
          </div>
          {hasProfile ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('dashboard.cardId')}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{profile.rationCardNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('dashboard.head')}</span>
                <span className="font-semibold text-slate-800">{profile.headOfFamily}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('dashboard.members')}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{t('dashboard.memberCount', { count: profile.totalMembers || 1 })}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">{t('dashboard.recordStatus')}</span>
                <span className={`${chip} border-[#198754] bg-[#198754]/10 text-[#198754]`}>{t('dashboard.activeRecord')}</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <AlertCircle size={18} />
                <span>{t('dashboard.setupRequired')}</span>
              </div>
              <p className="text-sm text-amber-800">
                {t('dashboard.setupBody')}
              </p>
            </div>
          )}

          <button onClick={() => onNavigate('profile')} className={`${swiss.btnSecondary} w-full`}>
            <span>{hasProfile ? t('dashboard.manageProfile') : t('dashboard.setupProfile')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className={`${swiss.panel} p-6 space-y-4`}>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 border border-[#0D6EFD]/30 bg-[#0D6EFD]/10 text-[#0D6EFD] flex items-center justify-center shrink-0" aria-hidden="true">
              <Clock size={15} />
            </span>
            <SectionHead title={t('dashboard.collectionAppt')} />
          </div>
          {booking ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('dashboard.status')}</span>
                <span className={`${chip} border-[#0D6EFD] bg-[#0D6EFD]/10 text-[#0D6EFD]`}>{booking.status ? bookingStatusLabel(booking.status) : t('dashboard.confirmed')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={13} /> {t('dashboard.date')}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{booking.distributionDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock size={13} /> {t('dashboard.timeSlot')}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{booking.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 size={13} /> {t('dashboard.distCentre')}</span>
                <span className="font-semibold text-slate-800 text-right">{delivery.to.label}</span>
              </div>
            </div>
          ) : (
            <div className={`${swiss.panel} p-5 text-slate-500 text-sm flex items-center gap-3`}>
              <Calendar size={20} className="shrink-0 text-slate-500" />
              <span>{t('dashboard.noWindow')}</span>
            </div>
          )}

          <button
            onClick={() => onNavigate('booking')}
            className={`w-full bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${FOCUS}`}
          >
            <span>{booking ? t('dashboard.reschedule') : t('dashboard.bookSlot')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {booking && !isMissed && (
        <div className="bg-amber-50 border border-amber-300 px-4 py-2.5 flex items-center gap-2.5" role="status" title={t('dashboard.bookingStatusTitle')}>
          <Bell size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
          <p className="text-sm text-slate-700">{t('dashboard.nextConfirmed')}</p>
        </div>
      )}

      {booking && isMissed && (
        <div className="bg-[#DC3545]/10 border border-[#DC3545]/40 px-4 py-3 flex items-start gap-2.5" role="alert" title={t('dashboard.bookingStatusTitle')}>
          <AlertTriangle size={16} className="text-[#DC3545] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#DC3545]">{t('dashboard.missedTitle')}</p>
            <p className="text-sm text-slate-700 mt-0.5">{t('dashboard.missedBody', { date: missedDateLabel })}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('booking')}
            className={`shrink-0 bg-[#DC3545] hover:bg-[#B02A37] text-white text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${FOCUS}`}
          >
            <span>{t('dashboard.missedCta')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
