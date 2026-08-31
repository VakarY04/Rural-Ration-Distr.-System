import { useState, useEffect } from 'react';
import {
  AlertCircle, ArrowRight, Calendar, Clock, Bell,
  ShoppingBag, Home, Building2, Wheat,
} from 'lucide-react';
import DeliveryRouteMap from '../components/DeliveryRouteMap';
import { API_URL } from '../services/api';
import { swiss, SectionHead } from '../components/ui/swiss';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

const chip = 'inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider';

function IconChip({ icon: Icon, tone }) {
  const palette = {
    green: 'border-green-200 bg-green-50 text-green-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-600',
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
        <p className={swiss.micro}>Namaste, {name} 👋</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className={swiss.headline}>Terminal Hub</h1>
          <span className="text-base font-medium text-slate-400">Terminal Hub</span>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {hasProfile
            ? `Ration card ${profile.rationCardNumber} · Household of ${profile.totalMembers} member${profile.totalMembers === 1 ? '' : 's'}`
            : 'No household profile on file yet'}
        </p>
      </header>

      <section className={`${swiss.panel} grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200`}>
        <div className="p-6">
          <p className={swiss.micro}>Profile status</p>
          <p className={`mt-2 text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums ${hasProfile ? 'text-green-700' : 'text-amber-600'}`}>
            {hasProfile ? 'Complete' : 'Incomplete'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{hasProfile ? 'All details are up to date' : 'Some details are missing'}</p>
        </div>
        <div className="p-6">
          <p className={swiss.micro}>Next collection</p>
          <p className={`mt-2 text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums ${booking ? 'text-slate-900' : 'text-slate-300'}`}>
            {booking ? booking.distributionDate : 'Not scheduled'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{booking ? booking.timeSlot : 'Book a slot to see it here'}</p>
        </div>
        <div className="p-6 flex items-end justify-between gap-4">
          <div>
            <p className={swiss.micro}>Monthly quota</p>
            <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums text-slate-900">
              {ration.totalKg}
              <span className="text-lg font-bold text-slate-400 ml-1">kg</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Total entitlement</p>
          </div>
          <IconChip icon={ShoppingBag} tone="orange" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-stretch">
        <div className={`${swiss.panel} overflow-hidden h-full min-h-[420px]`}>
          <DeliveryRouteMap origin={delivery.from} destination={delivery.to} />
        </div>

        <div className="space-y-4">
          <div className={`${swiss.panel} p-5`}>
            <SectionHead title="Delivery details" />
            <div className="space-y-4 mt-4">
              <div>
                <p className={swiss.label}>From</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                    <Home size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{delivery.from.label}</span>
                </div>
              </div>
              <div>
                <p className={swiss.label}>To</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-green-200 bg-green-50 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-green-700" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{delivery.to.label}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              Assigned by your registered district — collect your ration from here.
            </p>
          </div>

          <div className={`${swiss.panel} p-5`}>
            <SectionHead title="Items & quantity" />
            <div className="space-y-3 mt-4">
              {ration.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 border border-amber-200 bg-amber-50 flex items-center justify-center shrink-0">
                      <Wheat size={14} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">{item.label}</span>
                  </div>
                  <span className="text-sm font-extrabold tracking-tight tabular-nums text-slate-900 shrink-0">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              Calculated from your household size ({ration.totalMembers} member{ration.totalMembers === 1 ? '' : 's'}).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${swiss.panel} p-6 space-y-4`}>
          <SectionHead title="Household registry profile" />
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
                <span className={`${chip} border-green-600 bg-green-50 text-green-700`}>Active household record</span>
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
          <SectionHead title="Collection window appointment" />
          {booking ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className={`${chip} border-blue-600 bg-blue-50 text-blue-700`}>{booking.status || 'Confirmed'}</span>
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
              <Calendar size={20} className="shrink-0 text-slate-400" />
              <span>No collection window is currently scheduled.</span>
            </div>
          )}

          <button
            onClick={() => onNavigate('booking')}
            className={`w-full bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-medium tracking-wider px-4 py-2.5 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${FOCUS}`}
          >
            <span>{booking ? 'Reschedule allocation' : 'Book a collection slot'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={18} className="text-amber-500" />
          <p className="text-sm text-slate-700">
            {booking
              ? 'Your next collection window is confirmed.'
              : 'Slot booking is open — reserve your collection window.'}
          </p>
        </div>
        <ArrowRight size={16} className="text-slate-400" />
      </div>
    </div>
  );
}
