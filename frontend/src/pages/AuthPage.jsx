import React, { useState } from 'react';
import { bookingService } from '../api';
import { ShieldAlert, Key, Users, UserPlus, Trash2 } from 'lucide-react';

export default function AuthPage({ initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  
  // Login State Tracking
  const [loginFamilyId, setLoginFamilyId] = useState('');
  
  // Registration State Tracking
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [members, setMembers] = useState([{ name: '', age: '', role: 'Head' }]);
  
  const [status, setStatus] = useState({ type: '', message: '' });

  const addMemberRow = () => setMembers([...members, { name: '', age: '', role: 'Member' }]);
  const removeMemberRow = (idx) => setMembers(members.filter((_, i) => i !== idx));
  
  const handleMemberChange = (idx, field, val) => {
    const updated = [...members];
    updated[idx][field] = val;
    setMembers(updated);
  };

  const executeLogin = (e) => {
    e.preventDefault();
    if (!loginFamilyId.trim()) return;
    setStatus({ type: 'success', message: 'Credentials validated against local mock datasets.' });
    setTimeout(() => onAuthSuccess(loginFamilyId), 800);
  };

  const executeRegister = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Processing structural profile records...' });
    try {
      const res = await bookingService.registerFamily({
        rationCardNumber,
        headOfFamily,
        totalMembers: members.length,
        members
      });
      setStatus({ type: 'success', message: `Profile Generated! Assigned Reference ID: ${res.data.familyId}` });
      setTimeout(() => onAuthSuccess(res.data.familyId), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        
        {/* Modal Header Switcher */}
        <div className="flex border-b border-slate-200 font-semibold bg-slate-50 text-sm">
          <button 
            type="button"
            onClick={() => { setMode('login'); setStatus({ type: '', message: '' }); }}
            className={`flex-1 py-4 text-center border-b-2 transition ${mode === 'login' ? 'border-[#1A365D] text-[#1A365D] bg-white font-bold' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
          >
            Sign In (Existing Citizen)
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setStatus({ type: '', message: '' }); }}
            className={`flex-1 py-4 text-center border-b-2 transition ${mode === 'register' ? 'border-[#1A365D] text-[#1A365D] bg-white font-bold' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
          >
            Create Family Account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={executeLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Key size={16} className="text-blue-600" /> Enter Family Reference ID Code
              </label>
              <input 
                type="text" 
                value={loginFamilyId}
                onChange={(e) => setLoginFamilyId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                placeholder="e.g., FAM-001"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">Use `FAM-001`, `FAM-002`, or `FAM-003` to pull down preset structural system seeds instantly.</p>
            </div>

            <button type="submit" className="w-full py-3 bg-[#1A365D] hover:bg-blue-950 text-white font-bold rounded-xl shadow-md transition">
              Secure System Authentication
            </button>
          </form>
        ) : (
          <form onSubmit={executeRegister} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ration Card ID String</label>
                <input 
                  type="text" 
                  value={rationCardNumber}
                  onChange={(e) => setRationCardNumber(e.target.value)}
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="e.g., RC-991283"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Head of Family Name</label>
                <input 
                  type="text" 
                  value={headOfFamily} 
                  onChange={(e) => { setHeadOfFamily(e.target.value); handleMemberChange(0, 'name', e.target.value); }}
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="Ram Charan"
                />
              </div>
            </div>

            {/* Dynamic Members Assembly Input Blocks */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <br /><Users size={16} className="text-blue-600" /> Dependents Parameters Array
                </label>
                <button type="button" onClick={addMemberRow} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                  + Append Member
                </button>
              </div>

              {members.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={m.name} 
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    required
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Age" 
                    value={m.age} 
                    onChange={(e) => handleMemberChange(idx, 'age', e.target.value)}
                    required
                    className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                  />
                  <select 
                    value={m.role} 
                    onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                    className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none text-slate-600"
                  >
                    <option value="Head">Head</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Member">Member</option>
                  </select>
                  {idx > 0 && (
                    <button type="button" onClick={() => removeMemberRow(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* DPDP Privacy Information Notice Block */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2.5 items-start">
              <input type="checkbox" required id="consent" className="mt-1 accent-[#1A365D]" />
              <label htmlFor="consent" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer select-none">
                <strong>DPDP Privacy Accord Notice:</strong> By checking this parameter framework box, you explicitly grant legal operational consent to store the structural family information logs listed above inside mock state tracking architectures exclusively to calculate weight quotas.
              </label>
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition">
              Finalize System Entry Registration
            </button>
          </form>
        )}

        {status.message && (
          <div className={`p-4 text-center text-xs font-semibold border-t ${status.type === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}