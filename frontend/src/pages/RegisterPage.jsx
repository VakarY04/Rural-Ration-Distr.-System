import React, { useState } from 'react';
import { bookingService } from '../api';
import { Users, UserPlus, Trash2, ShieldCheck, Camera } from 'lucide-react';

export default function RegisterPage({ onRegistrationSuccess }) {
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [members, setMembers] = useState([{ name: '', age: '', role: 'Member' }]);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Append extra structural element row for a new child/spouse
  const addMemberRow = () => {
    setMembers([...members, { name: '', age: '', role: 'Member' }]);
  };

  // Strip element entry row out of tracking arrays
  const removeMemberRow = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Encrypting data arrays...' });

    try {
      const response = await bookingService.registerFamily({
        rationCardNumber,
        headOfFamily,
        totalMembers: members.length,
        members,
        photoUrl
      });
      
      setStatus({
        type: 'success',
        message: `Profile Created Successfully! Write down your generated Reference Key: ${response.data.familyId}`
      });
      
      if (onRegistrationSuccess) onRegistrationSuccess(response.data.familyId);
    } catch (err) {
      setStatus({ type: 'error', message: err });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 px-6 py-6 text-white text-center">
          <h2 className="text-2xl font-bold tracking-tight">Citizen Profile Registration</h2>
          <p className="mt-1 text-emerald-100 text-sm">Register unit metrics, dependents information, and biometric verification references</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Card Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ration Card ID Number</label>
              <input
                type="text"
                value={rationCardNumber}
                onChange={(e) => setRationCardNumber(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., RC-883910293"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name (Head of Family)</label>
              <input
                type="text"
                value={headOfFamily}
                onChange={(e) => { setHeadOfFamily(e.target.value); handleMemberChange(0, 'name', e.target.value); handleMemberChange(0, 'role', 'Head'); }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Ram Charan"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Picture Image Address Link</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-500"
              placeholder="Paste a photo address link here (Optional)"
            />
          </div>

          {/* Biometrics Simulation Component Block */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck size={36} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Biometric Fingerprint Validation Bridge</h4>
                <p className="text-xs text-slate-500">System detected emulator mode. Aadhaar compliance hashes will be mock-generated automatically upon saving.</p>
              </div>
            </div>
            <button type="button" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2">
              <Camera size={14} /> Simulate Device Scan
            </button>
          </div>

          {/* Dynamic Members Configuration Array Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base"><Users size={18} className="text-emerald-600" /> Family Dependents List</h3>
              <button
                type="button"
                onClick={addMemberRow}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg flex items-center gap-1 transition"
              >
                <UserPlus size={14} /> Add Dependent
              </button>
            </div>

            {members.map((member, index) => (
              <div key={index} className="flex gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 w-6">#{index + 1}</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={member.age}
                  onChange={(e) => handleMemberChange(index, 'age', e.target.value)}
                  className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  required
                />
                <select
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                  className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-600"
                >
                  <option value="Head">Head</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Parent">Parent</option>
                  <option value="Member">Member</option>
                </select>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeMemberRow(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-emerald-100"
          >
            Finalize Family Registry Profile
          </button>
        </form>
      </div>
    </div>
  );
}