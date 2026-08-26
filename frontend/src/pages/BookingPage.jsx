import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { computeAllocatedItems, computeTotalQuotaKg } from '../utils/ration';
import { API_URL } from '../services/api';
import { swiss } from '../components/ui/swiss';
import { QuotaPanel, ActiveBookingTicket } from './booking/BookingSections';
import BookingForm from './booking/BookingForm';

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
    Promise.resolve().then(fetchProfileAndBooking);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
        <RefreshCw size={24} className="text-slate-900 animate-spin" />
        <p className={swiss.micro}>Verifying Household Profile Registry...</p>
      </div>
    );
  }

  // 2. Profile Check: Handles Missing or Incomplete Profile Data
  const isProfileComplete = profile && (profile.rationCardNumber || profile.rationCardId) && profile.headOfFamily;

  if (!isProfileComplete) {
    return (
      <div className={`max-w-2xl mx-auto mt-8 ${swiss.panel} p-8 text-center space-y-4 font-sans`}>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-slate-900">Household Profile Required</h3>
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
      <section className={`${swiss.panel} p-6 md:p-8 space-y-6`}>

        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className={`${swiss.micro} mb-1`}>Distribution Scheduling · वितरण अनुसूची</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Ration Bookings
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">राशन बुकिंग</p>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-md leading-relaxed">
              Select an available time window at your designated Fair Price Shop (FPS) terminal.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white text-slate-900 border border-slate-300 px-3 py-1.5 text-xs font-bold tabular-nums w-fit shrink-0">
            <CreditCard size={15} className="text-orange-600" />
            <span>Card ID: {cardId}</span>
          </div>
        </div>

        {/* Monthly Quota Allocation Block */}
        <QuotaPanel memberCount={memberCount} totalQuota={totalQuota} />

        <BookingForm
          error={error}
          success={success}
          bookingDetails={bookingDetails}
          onSubmit={handleCreateBooking}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          submitting={submitting}
          timeSlots={timeSlots}
        />
      </section>

      {/* Active Booking Summary Ticket (if slot booked) */}
      {bookingDetails && (
        <ActiveBookingTicket bookingDetails={bookingDetails} headOfFamily={profile.headOfFamily} />
      )}
    </div>
  );
}
