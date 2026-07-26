import React, { useState } from 'react';
import { bookingService } from '../api';
import { LogOut, Calendar, Clock, Award, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function CitizenDashboard({ familyId, onLogout }) {
  const [date, setDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [activeBooking, setActiveBooking] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const slots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  const executeSlotBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setStatus({ type: 'loading', message: 'Querying database concurrency ceilings...' });

    try {
      const res = await bookingService.createBooking({
        familyId,
        date,
        timeSlot: selectedSlot
      });
      setActiveBooking(res.data);
      setStatus({ type: 'success', message: 'Allocation slot successfully committed.' });
    } catch (err) {
      setStatus({ type: 'error', message: err });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans pb-12">
      {/* Dashboard Identity Banner */}
      <nav className="bg-[#1A365D] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wide uppercase bg-blue-800 px-2 py-1 rounded text-xs border border-blue-700">Ref: {familyId}</span>
          <h2 className="text-base font-bold text-slate-100 hidden sm:block">National E-Distribution Citizen Terminal</h2>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 font-bold px-3 py-2 rounded-xl transition shadow"
        >
          <LogOut size={14} /> Exit Session
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Grid Row Pillar: Structural Quota Assessment Tracking Blocks */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Calculated Quota Target</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#1A365D]">10</span>
              <span className="text-lg font-bold text-slate-600">KG / Member</span>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
              Standard state public commodity scaling metrics evaluate standard profiles at exactly 10KG per registered unit profile entry.
            </div>
          </div>

          {/* Verification Code Box Display */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Verification Security Slip Token</h3>
            {activeBooking ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border-2 border-dashed border-emerald-300">
                <div className="w-32 h-32 bg-white border border-slate-200 mx-auto flex flex-col items-center justify-center rounded-lg p-2">
                  <span className="text-[9px] font-bold text-slate-400 block mb-1">MOCK LOGISTICS QR</span>
                  <div className="w-24 h-24 bg-[#112233] rounded"></div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-green-50 px-2 py-1 rounded block">
                  {activeBooking.id}
                </span>
                <p className="text-[10px] text-slate-500">Present this token box verification structure directly to site supervisors.</p>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Log active slot reservation allocations below to generate dynamic verification slip references.
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Combined Grid Pillars: Live Time Scheduling Interfaces */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Reservation Handling Input Engine */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-[#1A365D] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-orange-600" /> Book Distribution Window
            </h3>

            {activeBooking ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3">
                <CheckCircle className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">Allocation Schedule Logged Successfully!</p>
                  <p><strong>Primary Card Representative:</strong> {activeBooking.headOfFamily}</p>
                  <p><strong>Target Pick-up Horizon:</strong> {activeBooking.date} at {activeBooking.timeSlot}</p>
                  <p><strong>Calculated Commodity Capacity:</strong> {activeBooking.allocatedWeightKg} KG (Pre-packing order generated)</p>
                </div>
              </div>
            ) : (
              <form onSubmit={executeSlotBooking} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Select Date</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Target Collection Hour</label>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map(s => (
                        <button
                          key={s} type="button" onClick={() => setSelectedSlot(s)}
                          className={`py-2 text-xs font-semibold rounded-lg border text-center transition ${selectedSlot === s ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {status.message && (
                  <div className={`p-3.5 rounded-xl text-xs font-medium border ${status.type === 'error' ? 'bg-red-50 text-red-800 border-red-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                    {status.message}
                  </div>
                )}

                <button type="submit" className="w-full py-3 bg-[#1A365D] hover:bg-blue-950 text-white font-bold rounded-xl shadow transition text-sm">
                  Commit Delivery Window Parameters
                </button>
              </form>
            )}
          </div>

          {/* AI-Powered Smart Grievance Sandbox Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Award size={16} className="text-purple-600" /> Integrated Gemini AI Assistance Module
            </h3>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3">
              <p className="text-xs text-purple-950 leading-relaxed">
                Struggling with slot structures or scheduling logistics parameters? Submit issues in your native language (e.g., Hindi, Tamil, Bengali). Our integrated language microservices will auto-process statements into translated logs.
              </p>
              <textarea 
                rows="2" 
                className="w-full p-2 text-xs bg-white border border-purple-200 rounded-lg outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-400" 
                placeholder="e.g., Mujhe agle hafte kheti ke kaam par jaana hai, kya mera slot badla jaa sakta hai?"
              />
              <button type="button" className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] rounded-lg transition shadow-sm">
                Analyze Ticket via AI Bridge
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}