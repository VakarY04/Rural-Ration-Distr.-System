import React, { useState, useEffect } from 'react';
import { citizenService, authService } from '../api';
import { Users, Calendar, LogOut, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function CitizenDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'booking'
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [members, setMembers] = useState([{ name: '', age: '', role: 'Head' }]);
  
  const [bookingDate, setBookingDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [savedWeight, setSavedWeight] = useState(0);

  const [status, setStatus] = useState({ type: '', message: '' });
  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  useEffect(() => {
    loadUserMetadata();
  }, []);

  const loadUserMetadata = async () => {
    try {
      const profileRes = await citizenService.getProfile();
      if (profileRes.data) {
        setRationCardNumber(profileRes.data.rationCardNumber);
        setHeadOfFamily(profileRes.data.headOfFamily);
        setMembers(profileRes.data.members);
        setSavedWeight(profileRes.data.allocatedWeightKg);
      }
      const bookingRes = await citizenService.getActiveBooking();
      if (bookingRes.data) setActiveBooking(bookingRes.data);
    } catch (err) {
      console.log("Initial fetch sequence passed quietly.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      const res = await citizenService.saveProfile({ rationCardNumber, headOfFamily, members });
      setSavedWeight(res.data.allocatedWeightKg);
      setStatus({ type: 'success', message: 'Family metrics securely saved to MongoDB database.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.toString() });
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setStatus({ type: '', message: '' });
    try {
      const res = await citizenService.createBooking({ date: bookingDate, timeSlot: selectedSlot });
      setActiveBooking(res.data);
      setStatus({ type: 'success', message: 'Ration delivery collection slot successfully secured!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.toString() });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <nav className="bg-[#1A365D] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h2 className="font-bold tracking-tight text-sm uppercase">National Food Security Registry</h2>
        <button onClick={() => { authService.logout(); onLogout(); }} className="flex items-center gap-1 bg-red-600 text-xs px-3 py-1.5 font-bold rounded-lg hover:bg-red-700 transition">
          <LogOut size={12} /> Log Out
        </button>
      </nav>

      {/* Internal Tab Bar Navigators */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="flex border-b border-slate-200 gap-2 text-sm font-semibold">
          <button onClick={() => { setActiveTab('profile'); setStatus({ type: '', message: '' }); }} className={`px-4 py-2 border-b-2 transition ${activeTab === 'profile' ? 'border-blue-800 text-blue-800 font-bold' : 'border-transparent text-slate-500'}`}>
            1. Edit Family Profile details
          </button>
          <button onClick={() => { setActiveTab('booking'); setStatus({ type: '', message: '' }); }} className={`px-4 py-2 border-b-2 transition ${activeTab === 'booking' ? 'border-blue-800 text-blue-800 font-bold' : 'border-transparent text-slate-500'}`}>
            2. Schedule Ration Allocation Slot
          </button>
        </div>

        {status.message && (
          <div className={`mt-4 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span>{status.message}</span>
          </div>
        )}

        {activeTab === 'profile' ? (
          <form onSubmit={handleSaveProfile} className="mt-6 bg-white p-6 rounded-2xl shadow border border-slate-200 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ration Document Reference ID</label>
                <input type="text" value={rationCardNumber} onChange={(e) => setRationCardNumber(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g., RC-98217" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Head of Family Representative</label>
                <input type="text" value={headOfFamily} onChange={(e) => { setHeadOfFamily(e.target.value); const updated = [...members]; updated[0].name = e.target.value; setMembers(updated); }} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g., Ram Charan" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1"><Users size={14} /> Dependents Structure Log Grid</h4>
                <button type="button" onClick={() => setMembers([...members, { name: '', age: '', role: 'Member' }])} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-0.5"><Plus size={10}/> Append Row</button>
              </div>

              {members.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <input type="text" placeholder="Full Name" value={m.name} required onChange={(e) => { const u = [...members]; u[idx].name = e.target.value; setMembers(u); }} className="flex-1 p-1.5 border border-slate-200 bg-white rounded text-xs outline-none" />
                  <input type="number" placeholder="Age" value={m.age} required onChange={(e) => { const u = [...members]; u[idx].age = e.target.value; setMembers(u); }} className="w-16 p-1.5 border border-slate-200 bg-white rounded text-xs outline-none" />
                  <select value={m.role} onChange={(e) => { const u = [...members]; u[idx].role = e.target.value; setMembers(u); }} className="w-24 p-1.5 border border-slate-200 bg-white rounded text-xs outline-none text-slate-600">
                    <option value="Head">Head</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Member">Member</option>
                  </select>
                  {idx > 0 && <button type="button" onClick={() => setMembers(members.filter((_, i) => i !== idx))} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={14}/></button>}
                </div>
              ))}
            </div>

            {savedWeight > 0 && (
              <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-900 border border-blue-100 font-medium">
                Live State DB Assessment: Your family profile qualifies for exactly **{savedWeight}KG** of targeted commodities.
              </div>
            )}

            <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition uppercase shadow-md shadow-emerald-100">Sync Details to MongoDB Database</button>
          </form>
        ) : (
          <div className="mt-6 bg-white p-6 rounded-2xl shadow border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-1"><Calendar size={14}/> Secure Delivery Collection Window</h3>
            
            {activeBooking ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1.5">
                <p className="font-bold text-sm">Active Reservation Found!</p>
                <p><strong>Primary Cardholder Name:</strong> {activeBooking.headOfFamily}</p>
                <p><strong>Scheduled Distribution Window:</strong> {activeBooking.date} at {activeBooking.timeSlot}</p>
                <p><strong>Weight Order Logged:</strong> {activeBooking.allocatedWeightKg} KG</p>
                <div className="mt-2 pt-2 border-t border-emerald-200 text-[10px] font-mono tracking-wider bg-white p-1.5 text-center rounded border font-bold">SLIP SECURE REF: {activeBooking._id}</div>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Date</label>
                    <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Time Block Selector (Max 6 families capacity ceiling)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(t => (
                        <button key={t} type="button" onClick={() => setSelectedSlot(t)} className={`py-2 border text-center text-xs font-bold rounded-lg transition ${selectedSlot === t ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#1A365D] hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition uppercase">Lock Down Appointed Pickup Window</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}