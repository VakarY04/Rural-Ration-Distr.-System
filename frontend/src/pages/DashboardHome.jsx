import { useState, useEffect } from 'react';
import {
  AlertCircle, ArrowRight, Calendar, Clock, Bell, MapPin, Users,
  ShoppingBag, Building2,
} from 'lucide-react';
import DeliveryRouteMap from '../components/DeliveryRouteMap';
import { API_URL } from '../services/api';
import { swiss, SectionHead } from '../components/ui/swiss';

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
        <p className={swiss.micro}>Loading your terminal hub…</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center text-sm font-medium text-slate-500">
        Couldn't load your terminal hub right now. Please refresh the page.
      </div>
    );
  }

  const { name, profile, booking, ration, delivery } = summary;
  const hasProfile = Boolean(profile);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>Namaste, {name}</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className={swiss.headline}>Terminal Hub</h1>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {hasProfile
            ? `Ration card ${profile.rationCardNumber} · Household of ${profile.totalMembers} member${profile.totalMembers === 1 ? '' : 's'}`
            : 'No household profile on file yet'}
        </p>
        {summary.updatedAt && (
          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            Last reviewed {new Date(summary.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </header>

      <section className={`${swiss.panel} grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200`}>
        <div className="p-6 min-w-0 overflow-hidden">
          <p className={swiss.micro}>Profile status</p>
          <p className={`mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums break-words ${hasProfile ? 'text-[#198754]' : 'text-amber-600'}`}>
            {hasProfile ? 'Complete' : 'Incomplete'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{hasProfile ? 'All details are up to date' : 'Some details are missing'}</p>
        </div>
        <div className="p-6 min-w-0 overflow-hidden">
          <p className={swiss.micro}>Next collection</p>
          <p className={`mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums break-words ${booking ? 'text-slate-900' : 'text-slate-500'}`}>
            {booking ? booking.distributionDate : 'Not scheduled'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{booking ? booking.timeSlot : 'Book a slot to see it here'}</p>
        </div>
        <div className="p-6 min-w-0 overflow-hidden flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className={swiss.micro}>Monthly quota</p>
            <p className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight tabular-nums text-slate-900 break-words">
              {ration.totalKg}
              <span className="text-lg font-bold text-slate-500 ml-1">kg</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Total entitlement</p>
          </div>
          <IconChip icon={ShoppingBag} tone="orange" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-stretch">
        <div className={`${swiss.panel} overflow-hidden h-[360px]`} title="Delivery route map — use + / − controls to zoom">
          <DeliveryRouteMap origin={delivery.from} destination={delivery.to} />
        </div>

        <div className="space-y-4">
          <div className={`${swiss.panel} p-5`}>
            <SectionHead title="Delivery details" />
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">From warehouse</p>
                <div className="mt-1.5 flex items-start gap-2">
                  <MapPin size={14} className="text-orange-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{delivery.from.label}</p>
                    <p className="text-xs text-slate-500 leading-snug">{delivery.from.address}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">To collection centre</p>
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
              Assigned by your registered district — collect your ration from here.
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
            <SectionHead title="Household registry profile" />
          </div>
          {hasProfile ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Ration card ID</span>
                <span className="font-semibold text-slate-800 tabular-nums">{profile.rationCardNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Head of family</span>
                <span className="font-semibold text-slate-800">{profile.headOfFamily}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Registered family members</span>
                <span className="font-semibold text-slate-800 tabular-nums">{profile.totalMembers || 1} member(s)</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Record status</span>
                <span className={`${chip} border-[#198754] bg-[#198754]/10 text-[#198754]`}>Active household record</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <AlertCircle size={18} />
                <span>Profile setup required</span>
              </div>
              <p className="text-sm text-amber-800">
                Add your household members to establish your distribution quota.
              </p>
            </div>
          )}

          <button onClick={() => onNavigate('profile')} className={`${swiss.btnSecondary} w-full`}>
            <span>{hasProfile ? 'Manage household profile' : 'Set up household profile'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className={`${swiss.panel} p-6 space-y-4`}>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 border border-[#0D6EFD]/30 bg-[#0D6EFD]/10 text-[#0D6EFD] flex items-center justify-center shrink-0" aria-hidden="true">
              <Clock size={15} />
            </span>
            <SectionHead title="Collection window appointment" />
          </div>
          {booking ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className={`${chip} border-[#0D6EFD] bg-[#0D6EFD]/10 text-[#0D6EFD]`}>{booking.status || 'Confirmed'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={13} /> Date</span>
                <span className="font-semibold text-slate-800 tabular-nums">{booking.distributionDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock size={13} /> Time slot</span>
                <span className="font-semibold text-slate-800 tabular-nums">{booking.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 size={13} /> Distribution center</span>
                <span className="font-semibold text-slate-800 text-right">{delivery.to.label}</span>
              </div>
            </div>
          ) : (
            <div className={`${swiss.panel} p-5 text-slate-500 text-sm flex items-center gap-3`}>
              <Calendar size={20} className="shrink-0 text-slate-500" />
              <span>No collection window is currently scheduled.</span>
            </div>
          )}

          <button
            onClick={() => onNavigate('booking')}
            className={`w-full bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white text-xs font-semibold tracking-wide px-4 py-2.5 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${FOCUS}`}
          >
            <span>{booking ? 'Reschedule allocation' : 'Book a collection slot'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {booking && (
        <div className="bg-amber-50 border border-amber-300 px-4 py-2.5 flex items-center gap-2.5" role="status" title="Booking status notification">
          <Bell size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
          <p className="text-sm text-slate-700">Your next collection window is confirmed.</p>
        </div>
      )}
    </div>
  );
}
