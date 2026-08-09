import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertCircle, ArrowRight, Calendar, Clock, Bell,
  ShoppingBag, MapPin, Home, Building2, Wheat, ChevronDown, CircleUserRound,
} from 'lucide-react';
import DeliveryRouteMap from '../components/DeliveryRouteMap';

function IconChip({ icon: Icon, color }) {
  const palette = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${palette[color]}`}>
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
      setLoading(false);
      return;
    }

    fetch('http://localhost:5000/api/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => setSummary(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-24 text-center text-slate-400 text-sm font-medium">
        Loading your terminal hub…
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-6xl mx-auto py-24 text-center text-slate-500 text-sm font-medium">
        Couldn't load your terminal hub right now. Please refresh the page.
      </div>
    );
  }

  const { name, profile, booking, ration, delivery } = summary;
  const hasProfile = Boolean(profile);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">Namaste, {name} 👋</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terminal Hub</h1>
          <p className="text-sm text-slate-500 mt-1">
            {hasProfile
              ? `Ration card ${profile.rationCardNumber} · Household of ${profile.totalMembers} member${profile.totalMembers === 1 ? '' : 's'}`
              : 'No household profile on file yet'}
          </p>
        </div>

        {hasProfile && (
          <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shrink-0">
            <CircleUserRound size={32} className="text-slate-400" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 leading-tight">{name}</p>
              <p className="text-xs text-slate-400">Ration card: {profile.rationCardNumber}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <IconChip icon={ShieldCheck} color="emerald" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Profile status</p>
            <p className={`text-xl font-bold ${hasProfile ? 'text-emerald-600' : 'text-amber-600'}`}>
              {hasProfile ? 'Complete' : 'Incomplete'}
            </p>
            <p className="text-xs text-slate-400">{hasProfile ? 'All details are up to date' : 'Some details are missing'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <IconChip icon={Calendar} color="blue" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next collection</p>
            <p className="text-xl font-bold text-slate-900">{booking ? booking.distributionDate : 'Not scheduled'}</p>
            <p className="text-xs text-slate-400">{booking ? booking.timeSlot : 'Book a slot to see it here'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <IconChip icon={ShoppingBag} color="violet" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Monthly quota</p>
            <p className="text-xl font-bold text-slate-900">{ration.totalKg} kg</p>
            <p className="text-xs text-slate-400">Total entitlement</p>
          </div>
        </div>
      </div>

      {/* Map + right-hand delivery/item panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-stretch">
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-full min-h-[420px]">
          <DeliveryRouteMap origin={delivery.from} destination={delivery.to} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Ration delivery details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1.5">From</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Home size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{delivery.from.label}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1.5">To</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{delivery.to.label}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              Assigned by your registered district — collect your ration from here.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wheat size={16} className="text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Ration items &amp; quantity</h2>
            </div>
            <div className="space-y-3">
              {ration.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Wheat size={14} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 shrink-0">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              Calculated from your household size ({ration.totalMembers} member{ration.totalMembers === 1 ? '' : 's'}).
            </p>
          </div>
        </div>
      </div>

      {/* Household + appointment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className={hasProfile ? 'text-emerald-600' : 'text-amber-600'} />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Household registry profile</h2>
          </div>

          {hasProfile ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-emerald-100/70">
                <span className="text-slate-500">Ration card ID</span>
                <span className="font-semibold text-slate-800">{profile.rationCardNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-100/70">
                <span className="text-slate-500">Head of family</span>
                <span className="font-semibold text-slate-800">{profile.headOfFamily}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-100/70">
                <span className="text-slate-500">Registered dependents</span>
                <span className="font-semibold text-slate-800">{profile.dependentCount} member(s)</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Record status</span>
                <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Active household record
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <AlertCircle size={18} />
                <span>Profile setup required</span>
              </div>
              <p className="text-sm text-amber-800">
                Add your household members to establish your distribution quota.
              </p>
            </div>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{hasProfile ? 'Manage household profile' : 'Set up household profile'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Collection window appointment</h2>
            </div>
          </div>

          {booking ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-blue-100/70">
                <span className="text-slate-500">Status</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  {booking.status || 'Confirmed'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-blue-100/70">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={13} /> Date</span>
                <span className="font-semibold text-slate-800">{booking.distributionDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-blue-100/70">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock size={13} /> Time slot</span>
                <span className="font-semibold text-slate-800">{booking.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 size={13} /> Distribution center</span>
                <span className="font-semibold text-slate-800 text-right">{delivery.to.label}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-blue-100 p-5 rounded-xl text-slate-500 text-sm flex items-center gap-3">
              <Calendar size={20} className="shrink-0 text-slate-400" />
              <span>No collection window is currently scheduled.</span>
            </div>
          )}

          <button
            onClick={() => onNavigate('booking')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{booking ? 'Reschedule allocation' : 'Book a collection slot'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Notice strip */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
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