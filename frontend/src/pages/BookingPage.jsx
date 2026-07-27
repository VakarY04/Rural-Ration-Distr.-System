import React, { useState } from 'react';
import { citizenService } from '../api';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function BookingPage({ activeBooking, profile, onBookingSuccess }) {
  const [bookingDate, setBookingDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setStatus({ type: '', message: '' });

    try {
      const res = await citizenService.createBooking({ date: bookingDate, timeSlot: selectedSlot });
      onBookingSuccess(res.data);
      setStatus({ type: 'success', message: ' Rations delivery collection slot locked successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err });
    }
  };

  if (!profile) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow border border-slate-200 text-center text-xs text-slate-500">
        Please complete your household information profile details before scheduling a delivery allocation window.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-[#1A365D] flex items-center gap-1"><Calendar size={16}/> Schedule Collection Window</h3>
        <p className="text-xs text-slate-500 mt-0.5">Automated safety constraints limit structural hours to exactly 6 family arrivals maximum.</p>
      </div>

      {activeBooking ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
          <p className="font-bold text-sm">Active Appointment Verified</p>
          <p><strong>Primary Distribution Target:</strong> {activeBooking.date} at {activeBooking.timeSlot}</p>
          <p><strong>Pre-packed Mass Cargo:</strong> {activeBooking.allocatedWeightKg} KG</p>
          <div className="mt-2 pt-2 border-t border-emerald-200 text-[10px] font-mono tracking-wider bg-white p-2 text-center rounded border font-bold">DIGITAL AUDIT SIGNATURE ID: {activeBooking._id}</div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Date</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Available Time Window Options</label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(t => (
                  <button key={t} type="button" onClick={() => setSelectedSlot(t)} className={`py-2 border text-center text-xs font-semibold rounded-xl transition ${selectedSlot === t ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{status.message}</span>
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-[#1A365D] hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition uppercase shadow-md shadow-blue-900/10">Lock Appointed Collection Slot</button>
        </form>
      )}
    </div>
  );
}