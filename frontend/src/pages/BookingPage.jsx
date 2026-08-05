import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ShoppingBag, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

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

  // Fetch Family Profile on Component Mount
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const token = localStorage.getItem('ration_user_token');
      if (!token) {
        setError('Authorization session expired. Please log in again.');
        setLoadingProfile(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/family/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error verifying household profile:', err);
      setError('Could not connect to authentication server to verify profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
      const memberCount = profile?.members?.length || 1;

      const bookingPayload = {
        rationCardNumber: profile?.rationCardNumber,
        headOfFamily: profile?.headOfFamily,
        distributionDate: selectedDate,
        timeSlot: selectedSlot,
        allocatedItems: [
          { name: 'Rice', quantity: `${memberCount * 5} kg` },
          { name: 'Wheat Flour', quantity: `${memberCount * 5} kg` },
          { name: 'Sugar', quantity: `${memberCount * 1} kg` },
          { name: 'Refined Oil', quantity: '1 Liter' }
        ]
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw size={28} className="text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifying Household Profile Registry...</p>
      </div>
    );
  }

  // 2. Profile Check: Handles Missing or Incomplete Profile Data
  const isProfileComplete = profile && (profile.rationCardNumber || profile.rationCardId) && profile.headOfFamily;

  if (!isProfileComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/60">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Household Profile Required</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Please complete your household information profile details under the <strong className="text-slate-700">Family Profiles</strong> tab before scheduling a delivery allocation window.
          </p>
        </div>
      </div>
    );
  }

  const memberCount = profile.members?.length || 1;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Schedule Ration Distribution Slot</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select an available time window at your designated Fair Price Shop (FPS) terminal.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold w-fit">
            <UserCheck size={16} />
            <span>Card ID: {profile.rationCardNumber || profile.rationCardId}</span>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-bold space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
            {bookingDetails && (
              <p className="text-[11px] font-medium text-emerald-600 pl-6">
                Confirmed for {bookingDetails.distributionDate} during {bookingDetails.timeSlot}.
              </p>
            )}
          </div>
        )}

        {/* Calculated Allowance Summary */}
        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
            <ShoppingBag size={16} className="text-blue-600" />
            <span>Monthly Quota Allocation ({memberCount} Registered Member{memberCount > 1 ? 's' : ''})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Rice</span>
              <span className="text-sm font-black text-slate-800">{memberCount * 5} kg</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Wheat Flour</span>
              <span className="text-sm font-black text-slate-800">{memberCount * 5} kg</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Sugar</span>
              <span className="text-sm font-black text-slate-800">{memberCount * 1} kg</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Refined Oil</span>
              <span className="text-sm font-black text-slate-800">1 Liter</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleCreateBooking} className="space-y-6 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Select Distribution Date</span>
              </label>
              <input 
                type="date" 
                required 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Time Slot Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} />
                <span>Select Terminal Time Slot</span>
              </label>
              <select 
                required 
                value={selectedSlot} 
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">-- Choose Time Window --</option>
                {timeSlots.map((slot, i) => (
                  <option key={i} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={submitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-4 rounded-2xl transition duration-200 shadow-lg uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ShieldCheck size={16} />
            <span>{submitting ? 'Confirming Window Allocation...' : 'Confirm Distribution Booking'}</span>
          </button>

        </form>
      </div>
    </div>
  );
}