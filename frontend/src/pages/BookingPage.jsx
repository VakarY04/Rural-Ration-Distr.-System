import React, { useState } from 'react';
import { bookingService } from '../api';
import { Calendar, Clock, User, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BookingPage() {
  // Application State Control
  const [familyId, setFamilyId] = useState('FAM-001'); // Defaulting to first mock seed item
  const [date, setDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Available institutional delivery slot windows
  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setStatus({ type: 'error', message: 'Please select a preferred time slot window.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Verifying slot limits and identity...' });

    try {
      const result = await bookingService.createBooking({
        familyId,
        date,
        timeSlot: selectedSlot
      });

      setStatus({
        type: 'success',
        message: `Success! Secured allocation for ${result.data.headOfFamily}. Allocated Weight: ${result.data.allocatedWeightKg}Kg.`
      });
    } catch (err) {
      // Captures full exceptions directly from the Express backend check rules
      setStatus({ type: 'error', message: err });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 px-6 py-8 text-white text-center">
          <h2 className="text-2xl font-bold tracking-tight">Rural Ration Scheduler</h2>
          <p className="mt-2 text-blue-100 text-sm">Select a convenient collection window to bypass long distributions lines</p>
        </div>

        <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
          {/* Identity input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-blue-500" /> Family ID (Ration System Reference)
            </label>
            <input
              type="text"
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., FAM-001"
              required
            />
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Target Distribution Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          {/* Grid Layout Timetable */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-blue-500" /> Select Collection Hours (Max 6 Families per Hour)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 text-sm font-medium rounded-xl border text-center transition duration-200 ${
                    selectedSlot === slot
                      ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic feedback messages */}
          {status.message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
              status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {status.type === 'success' ? <CheckCircle className="shrink-0 text-green-600" size={18} /> : <AlertTriangle className="shrink-0 text-red-600" size={18} />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-blue-100 disabled:shadow-none"
          >
            {status.type === 'loading' ? 'Processing Transaction...' : 'Confirm Allocation Window'}
          </button>
        </form>
      </div>
    </div>
  );
}