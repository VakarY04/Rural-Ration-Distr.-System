import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, ArrowRight, Clock } from 'lucide-react';

export default function DashboardHome({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ration_user_token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:5000/api/family/profile', { headers }).then(r => r.ok ? r.json() : null),
      fetch('http://localhost:5000/api/bookings', { headers }).then(r => r.ok ? r.json() : [])
    ])
      .then(([profData, bookData]) => {
        if (profData?.rationCardNumber) setProfile(profData);
        if (Array.isArray(bookData) && bookData.length > 0) setBooking(bookData[0]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Terminal Header */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md">
        <h1 className="text-xl font-black tracking-tight">Welcome to your E-Ration Terminal</h1>
        <p className="text-xs text-slate-300 font-medium mt-1">
          Manage your official household registration records and collection milestones seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HOUSEHOLD REGISTRY PROFILE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Household Registry Profile</h2>
          
          {profile ? (
            <div className="bg-emerald-50 border border-emerald-200/80 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle size={18} />
                <span>Active Household Record</span>
              </div>
              <div className="text-xs space-y-1 text-slate-700 font-medium pt-1">
                <p><strong>Ration Card ID:</strong> {profile.rationCardNumber}</p>
                <p><strong>Head of Family:</strong> {profile.headOfFamily}</p>
                <p><strong>Registered Dependents:</strong> {profile.members?.length || 0} Member(s)</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <AlertCircle size={18} />
                <span>Profile Actions Required</span>
              </div>
              <p className="text-xs text-amber-800 font-medium">
                Please register your core household dependents layout list to establish distribution quotas.
              </p>
            </div>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{profile ? 'Manage Household Profile' : 'Setup Household Profile'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* COLLECTION WINDOW APPOINTMENT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Collection Window Appointment</h2>

          {booking ? (
            <div className="bg-blue-50 border border-blue-200/80 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <Calendar size={18} />
                  <span>Scheduled Appointment</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {booking.status || 'Confirmed'}
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-700 font-medium pt-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <span><strong>Date:</strong> {booking.distributionDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-600" />
                  <span><strong>Time Slot:</strong> {booking.timeSlot}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-slate-500 text-xs font-medium flex items-center gap-3">
              <Calendar size={20} className="shrink-0 text-slate-400" />
              <span>No distribution window appointments are currently scheduled for this account instance.</span>
            </div>
          )}

          <button
            onClick={() => onNavigate('booking')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <span>{booking ? 'Reschedule Allocation' : 'Book Collection Slot'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}