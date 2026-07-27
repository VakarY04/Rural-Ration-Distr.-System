import React from 'react';
import { ShieldAlert, Award, CalendarClock } from 'lucide-react';

export default function DashboardHome({ profile, booking, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#1A365D] text-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold">Welcome to your E-Ration Terminal</h2>
        <p className="text-xs text-slate-300 mt-1">Manage your official household registration records and collection milestones seamlessly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card Summary Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Household Registry Profile</h3>
            {profile ? (
              <div className="mt-2 space-y-1">
                <p className="text-lg font-bold text-slate-800">{profile.headOfFamily}</p>
                <p className="text-xs text-slate-500">Card Ref: <span className="font-mono font-bold uppercase">{profile.rationCardNumber}</span></p>
                <p className="text-xs text-[#1A365D] font-bold mt-2">Active Quota Capacity: {profile.allocatedWeightKg} KG</p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl flex items-start gap-2 text-xs">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Profile Actions Required</p>
                  <p className="mt-0.5">Please register your core household dependents layout list to establish distribution quotas.</p>
                </div>
              </div>
            )}
          </div>
          {!profile && (
            <button onClick={() => onNavigate('profile')} className="mt-4 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition">
              Setup Household Profile
            </button>
          )}
        </div>

        {/* Booking Card Summary Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Window Appointment</h3>
            {booking ? (
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <p className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">Slot Secured</p>
                <p className="mt-2"><strong>Appointment Target:</strong> {booking.date}</p>
                <p><strong>Pickup Time Block:</strong> {booking.timeSlot}</p>
                <p><strong>Cargo Target Weight:</strong> {booking.allocatedWeightKg} KG</p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl flex items-start gap-2 text-xs">
                <CalendarClock size={16} className="shrink-0 mt-0.5" />
                <p>No distribution window appointments are currently scheduled for this account instance.</p>
              </div>
            )}
          </div>
          {!booking && profile && (
            <button onClick={() => onNavigate('booking')} className="mt-4 w-full py-2 bg-[#1A365D] hover:bg-blue-950 text-white font-bold text-xs rounded-xl transition">
              Schedule Collection Slot
            </button>
          )}
        </div>
      </div>
    </div>
  );
}