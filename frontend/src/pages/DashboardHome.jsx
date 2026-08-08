import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowRight, Calendar, Clock, Bell } from 'lucide-react';
import DeliveryRouteMap from '../components/DeliveryRouteMap';

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
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">Namaste, {name}</p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terminal hub</h1>
        <p className="text-sm text-slate-500 mt-1">
          {hasProfile
            ? `Ration card ${profile.rationCardNumber} · Household of ${profile.totalMembers} member${profile.totalMembers === 1 ? '' : 's'}`
            : 'No household profile on file yet'}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Profile status</p>
          <p className={`text-2xl font-bold ${hasProfile ? 'text-emerald-600' : 'text-amber-600'}`}>
            {hasProfile ? 'Complete' : 'Incomplete'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Next collection</p>
          <p className="text-2xl font-bold text-slate-900">
            {booking ? booking.distributionDate : 'Not scheduled'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Monthly quota</p>
          <p className="text-2xl font-bold text-slate-900">{ration.totalKg} kg</p>
        </div>
      </div>

      {/* Map + right-hand delivery/item panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-stretch">
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-full min-h-[420px]">
          <DeliveryRouteMap origin={delivery.from} destination={delivery.to} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
              Ration delivery details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">From</label>
                <input
                  type="text"
                  value={delivery.from.label}
                  disabled
                  className="w-full mt-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">To</label>
                <input
                  type="text"
                  value={delivery.to.label}
                  disabled
                  className="w-full mt-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Set by the distributor once the admin module is live.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
              Ration items &amp; quantity
            </h2>
            <div className="space-y-2.5">
              {ration.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <input
                    type="text"
                    value={`${item.quantity} ${item.unit}`}
                    disabled
                    className="w-28 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-right text-slate-600 cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Calculated from your household size ({ration.totalMembers} member{ration.totalMembers === 1 ? '' : 's'}).
            </p>
          </div>
        </div>
      </div>

      {/* Household + appointment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Household registry profile</h2>

          {hasProfile ? (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <CheckCircle size={18} />
                <span>Active household record</span>
              </div>
              <div className="text-sm space-y-1 text-slate-700 pt-1">
                <p><strong>Ration card ID:</strong> {profile.rationCardNumber}</p>
                <p><strong>Head of family:</strong> {profile.headOfFamily}</p>
                <p><strong>Registered dependents:</strong> {profile.dependentCount} member(s)</p>
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{hasProfile ? 'Manage household profile' : 'Set up household profile'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Collection window appointment</h2>

          {booking ? (
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                  <Calendar size={18} />
                  <span>Scheduled appointment</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  {booking.status || 'Confirmed'}
                </span>
              </div>
              <div className="text-sm space-y-1 text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <span><strong>Date:</strong> {booking.distributionDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-600" />
                  <span><strong>Time slot:</strong> {booking.timeSlot}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-slate-500 text-sm flex items-center gap-3">
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
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
