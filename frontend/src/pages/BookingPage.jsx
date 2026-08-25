import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  Lock,
  Wheat,
  Scale,
  Contact,
  Info,
} from 'lucide-react';
import { computeAllocatedItems, computeTotalQuotaKg } from '../utils/ration';
import { API_URL } from '../services/api';

export default function BookingPage() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  // Available Time Slots
  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];

  // Fetch Family Profile & Active Booking on Component Mount
  const fetchProfileAndBooking = async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const token = localStorage.getItem('ration_user_token');
      if (!token) {
        setError('Authorization session expired. Please log in again.');
        setLoadingProfile(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, bookingRes] = await Promise.all([
        fetch(API_URL + '/family/profile', { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(API_URL + '/bookings/active', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (profileRes) {
        setProfile(profileRes);
      } else {
        setProfile(null);
      }

      if (bookingRes?.booking) {
        setBookingDetails(bookingRes.booking);
      }
    } catch (err) {
      console.error('Error verifying household profile:', err);
      setError('Could not connect to authentication server to verify profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileAndBooking();
  }, []);

  // Handle Booking Submission
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDate || !selectedSlot) {
      setError('Please select both a distribution date and time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('ration_user_token');
      // Total members considering the family members section
      const memberCount = profile?.members?.length ? profile.members.length : 1;

      const bookingPayload = {
        rationCardNumber: profile?.rationCardNumber,
        headOfFamily: profile?.headOfFamily,
        distributionDate: selectedDate,
        timeSlot: selectedSlot,
        allocatedItems: computeAllocatedItems(memberCount)
      };

      const response = await fetch(API_URL + '/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Ration distribution window scheduled successfully!');
        setBookingDetails(data.booking || bookingPayload);
      } else {
        setError(data.message || 'Failed to schedule booking slot.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setError('Could not connect to the booking service endpoint.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading State Indicator
  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 font-sans">
        <RefreshCw size={28} className="text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying Household Profile Registry...</p>
      </div>
    );
  }

  // 2. Profile Check: Handles Missing or Incomplete Profile Data
  const isProfileComplete = profile && (profile.rationCardNumber || profile.rationCardId) && profile.headOfFamily;

  if (!isProfileComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/60">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Household Profile Required</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Please complete your household information profile details under the <strong className="text-slate-700">Family Profiles</strong> tab before scheduling a delivery allocation window.
          </p>
        </div>
      </div>
    );
  }

  // Member count strictly considers the registered family members
  const memberCount = profile.members?.length ? profile.members.length : 1;
  const totalQuota = computeTotalQuotaKg(memberCount);
  const cardId = profile.rationCardNumber || profile.rationCardId || '122341';

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Main Booking Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/80 shrink-0">
              <Calendar size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Schedule Ration Distribution Slot</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select an available time window at your designated Fair Price Shop (FPS) terminal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-2xl text-xs font-bold w-fit shrink-0">
            <CreditCard size={15} className="text-emerald-700" />
            <span>Card ID: {cardId}</span>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle size={17} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span className="font-bold">{success}</span>
            </div>
            {bookingDetails && (
              <p className="text-[11px] font-medium text-emerald-700 pl-6">
                Confirmed distribution slot on <strong>{bookingDetails.distributionDate}</strong> during <strong>{bookingDetails.timeSlot}</strong>.
              </p>
            )}
          </div>
        )}

        {/* Monthly Quota Allocation Block */}
        <div className="bg-slate-50/80 border border-slate-200/80 p-5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Calendar size={16} className="text-blue-600" />
            <span>Monthly Quota Allocation ({memberCount} Registered Member{memberCount > 1 ? 's' : ''})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Wheat size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guaranteed Food Grains</p>
                <p className="text-lg font-black text-slate-900">{totalQuota} kg</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Scale size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Household Allocation Rate</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">10 kg / member (min 35 kg)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleCreateBooking} className="space-y-6 pt-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-500" />
                <span>SELECT DISTRIBUTION DATE</span>
              </label>
              <input 
                type="date" 
                required 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
              />
              <p className="text-[11px] text-slate-400 font-medium">Choose a future date for ration collection.</p>
            </div>

            {/* Time Slot Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-slate-500" />
                <span>SELECT TERMINAL TIME SLOT</span>
              </label>
              <select 
                required 
                value={selectedSlot} 
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
              >
                <option value="">-- Choose Time Window --</option>
                {timeSlots.map((slot, i) => (
                  <option key={i} value={slot}>{slot}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 font-medium">Select an available time window at your terminal.</p>
            </div>
          </div>

          {/* Identification Notice Strip */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 px-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
              <div className="w-5 h-5 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center shrink-0 text-[11px] font-bold">
                i
              </div>
              <p>
                <strong className="font-bold text-slate-900">Please ensure</strong> you carry your ration card and Aadhaar card at the time of collection.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-blue-200 px-3 py-1.5 rounded-xl shrink-0 shadow-2xs">
              <Contact size={18} className="text-blue-600" />
              <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-100" />
            </div>
          </div>

          {/* Submit Action Button */}
          <button 
            type="submit" 
            disabled={submitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-4 rounded-2xl transition duration-200 shadow-lg shadow-blue-500/25 uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.99] ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Confirming Window Allocation...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>CONFIRM DISTRIBUTION BOOKING</span>
              </>
            )}
          </button>

          {/* Bottom Security Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 text-emerald-800 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Your booking is safe and secure. You will receive a confirmation once the slot is booked successfully.</span>
            </div>
            <Lock size={14} className="text-emerald-600 shrink-0" />
          </div>

        </form>
      </div>

      {/* Active Booking Summary Ticket (if slot booked) */}
      {bookingDetails && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Active Scheduled Slot</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {bookingDetails.status || 'Confirmed'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
              <p className="font-bold text-slate-800 mt-0.5">{bookingDetails.distributionDate}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Time Window</p>
              <p className="font-bold text-slate-800 mt-0.5">{bookingDetails.timeSlot}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Cardholder</p>
              <p className="font-bold text-slate-800 mt-0.5">{profile.headOfFamily}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}