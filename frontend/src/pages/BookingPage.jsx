import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { computeAllocatedItems, computeTotalQuotaKg } from '../utils/ration';
import { API_URL } from '../services/api';
import { swissUser as swiss } from '../components/ui/swiss';
import { useLanguage } from '../i18n/LanguageContext';
import { QuotaPanel, ActiveBookingTicket } from './booking/BookingSections';
import BookingForm from './booking/BookingForm';

export default function BookingPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  // 7.2 — live slot windows from the admin-managed template (fallback to the
  // legacy four windows when the endpoint is unreachable, e.g. old backend).
  // When the admin has fixed a distribution date, citizens choose a time slot
  // only — the date picker locks to that day (server re-enforces on submit).
  const [fixedDate, setFixedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ]);
  const [availability, setAvailability] = useState({});

  // Fetch Family Profile & Active Booking on Component Mount
  const fetchProfileAndBooking = async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const token = localStorage.getItem('ration_user_token');
      if (!token) {
        setError(t('booking.sessionExpired'));
        setLoadingProfile(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, bookingRes, slotsRes] = await Promise.all([
        fetch(API_URL + '/family/profile', { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(API_URL + '/bookings/active', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch(API_URL + '/slots', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (profileRes) {
        setProfile(profileRes);
      } else {
        setProfile(null);
      }

      if (bookingRes?.booking) {
        setBookingDetails(bookingRes.booking);
      }

      if (Array.isArray(slotsRes?.slots) && slotsRes.slots.length) {
        setTimeSlots(slotsRes.slots.filter((s) => s?.label).map((s) => s.label));
      }
      if (slotsRes?.distributionDate) {
        setFixedDate(slotsRes.distributionDate);
        setSelectedDate(slotsRes.distributionDate);
      }
    } catch (err) {
      console.error('Error verifying household profile:', err);
      setError(t('booking.connectFailed'));
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchProfileAndBooking);
  }, []);

  // 7.2 — live per-window occupancy for the picked date (drives Full/Closed
  // disabling in the slot dropdown). Clears when the date is cleared.
  useEffect(() => {
    if (!selectedDate) {
      setAvailability({});
      return;
    }
    let active = true;
    const token = localStorage.getItem('ration_user_token');
    if (!token) return undefined;
    fetch(`${API_URL}/slots/availability?date=${encodeURIComponent(selectedDate)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const map = {};
        for (const s of data.slots || []) map[s.label] = s;
        setAvailability(map);
        // Drop a now-invalid selection (closed window renamed/closed).
        setSelectedSlot((prev) => {
          if (!prev) return prev;
          const info = map[prev];
          if (!info || info.isOpen === false || info.isFull) return '';
          return prev;
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedDate]);

  // Handle Booking Submission
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDate || !selectedSlot) {
      setError(t('booking.selectBoth'));
      return;
    }

    // 5.2 client mirror of the server past-date guard (server re-enforces).
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    if (selectedDate < todayStr) {
      setError(t('booking.pastDate'));
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
        setSuccess(t('booking.success'));
        setBookingDetails(data.booking || bookingPayload);
      } else if (response.status === 409 && data.code === 'SLOT_FULL') {
        setError(t('booking.slotFull'));
      } else if (response.status === 409 && data.code === 'SLOT_CLOSED') {
        setError(t('booking.slotClosed'));
      } else if (response.status === 400 && data.code === 'UNKNOWN_SLOT') {
        setError(t('booking.unknownSlot'));
      } else if (response.status === 409 && data.code === 'ALREADY_BOOKED') {
        setError(t('booking.alreadyBooked'));
      } else if (data.code === 'PAST_DATE') {
        setError(t('booking.pastDate'));
      } else if (data.code === 'FIXED_DATE') {
        setError(t('booking.fixedDate', { date: fixedDate || selectedDate }));
      } else {
        setError(data.message || t('booking.scheduleFailed'));
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(t('booking.serviceFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading State Indicator
  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
        <RefreshCw size={24} className="text-slate-900 animate-spin" />
        <p className={swiss.micro}>{t('booking.verifying')}</p>
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
          <h3 className="text-base md:text-xl font-extrabold tracking-tight text-slate-900">{t('booking.profileRequired')}</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            {(() => {
              const body = t('booking.profileRequiredBody');
              const label = t('booking.familyProfiles');
              const parts = body.split(label);
              if (parts.length < 2) return body;
              return (<>{parts[0]}<strong className="text-slate-700">{label}</strong>{parts.slice(1).join(label)}</>);
            })()}
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
            <p className={`${swiss.micro} mb-1`}>{t('booking.scheduling')}</p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-slate-900">
              {t('booking.title')}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-md leading-relaxed">
              {t('booking.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white text-slate-900 border border-slate-300 px-3 py-1.5 text-xs font-bold tabular-nums w-fit shrink-0">
            <CreditCard size={15} className="text-orange-600" />
            <span>{t('booking.cardId', { id: cardId })}</span>
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
          fixedDate={fixedDate}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          submitting={submitting}
          timeSlots={timeSlots}
          availability={availability}
        />
      </section>

      {/* Active Booking Summary Ticket (if slot booked) */}
      {bookingDetails && (
        <ActiveBookingTicket bookingDetails={bookingDetails} headOfFamily={profile.headOfFamily} />
      )}
    </div>
  );
}
