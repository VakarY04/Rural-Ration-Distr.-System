import { AlertCircle, CheckCircle2, RefreshCw, ShieldCheck, Lock, Calendar, Clock } from 'lucide-react';
import { swiss, SectionHead } from '../../components/ui/swiss';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// Slot-selection form for the Ration Bookings page — date + time window,
// ID notice strip and confirmation action. Pure presentation.
export default function BookingForm({
  error,
  success,
  bookingDetails,
  onSubmit,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotChange,
  submitting,
  timeSlots,
}) {
  return (
    <>
      {/* Dynamic Alerts */}
      {error && (
        <div role="alert" className="bg-[#DC3545]/10 border-l-4 border-[#DC3545] text-[#DC3545] p-4 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle size={17} className="shrink-0 text-[#DC3545]" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div role="status" className="bg-[#198754]/10 border-l-4 border-[#198754] text-[#198754] p-4 text-xs font-semibold space-y-1.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#198754]" />
            <span className="font-bold">{success}</span>
          </div>
          {bookingDetails && (
            <p className="text-[11px] font-medium text-[#198754] pl-6 tabular-nums">
              Confirmed distribution slot on <strong>{bookingDetails.distributionDate}</strong> during <strong>{bookingDetails.timeSlot}</strong>.
            </p>
          )}
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={onSubmit} className="space-y-6 border-t border-slate-200 pt-6">
        <SectionHead title="Select Slot" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label htmlFor="distribution-date" className={swiss.label}><span className="flex items-center gap-1.5"><Calendar size={12} aria-hidden="true" /> Distribution Date</span></label>
            <input
              id="distribution-date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className={`${swiss.input} cursor-pointer ${FOCUS}`}
            />
            <p className="text-[10px] md:text-[12px] text-slate-500 font-medium">Choose a future date for ration collection.</p>
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-1.5">
            <label htmlFor="time-slot" className={swiss.label}><span className="flex items-center gap-1.5"><Clock size={12} aria-hidden="true" /> Terminal Time Slot</span></label>
            <select
              id="time-slot"
              required
              value={selectedSlot}
              onChange={(e) => onSlotChange(e.target.value)}
              className={`${swiss.input} cursor-pointer ${FOCUS}`}
            >
              <option value="">-- Choose Time Window --</option>
              {timeSlots.map((slot, i) => (
                <option key={i} value={slot}>{slot}</option>
              ))}
            </select>
            <p className="text-[10px] md:text-[12px] text-slate-500 font-medium">Select an available time window at your terminal.</p>
          </div>
        </div>

        {/* Identification Notice Strip */}
        <div className="border border-[#0D6EFD]/30 bg-[#0D6EFD]/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
            <span aria-hidden="true" className="w-5 h-5 border border-[#0D6EFD] text-[#0D6EFD] flex items-center justify-center shrink-0 text-[11px] font-bold">
              i
            </span>
            <p>
              <strong className="font-bold text-slate-900">Please ensure</strong> you carry your ration card and Aadhaar card at the time of collection.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 shrink-0">
            <ShieldCheck size={16} className="text-[#0D6EFD]" />
            <Lock size={13} className="text-[#198754]" />
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${swiss.btnPrimary} py-4 text-xs`}
        >
          {submitting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Confirming Window Allocation...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>Confirm Distribution Booking</span>
            </>
          )}
        </button>

        {/* Bottom Security Banner */}
        <div className="border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#198754] shrink-0" />
            <span>Your booking is safe and secure. You will receive a confirmation once the slot is booked successfully.</span>
          </div>
          <Lock size={14} className="text-slate-500 shrink-0" />
        </div>
      </form>
    </>
  );
}
