import React, { useState } from 'react';
import { citizenService } from '../api';
import { Users, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage({ initialProfile, onProfileUpdate }) {
  const [rationCardNumber, setRationCardNumber] = useState(initialProfile?.rationCardNumber || '');
  const [headOfFamily, setHeadOfFamily] = useState(initialProfile?.headOfFamily || '');
  const [members, setMembers] = useState(initialProfile?.members || [{ name: '', age: '', role: 'Head' }]);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      const res = await citizenService.saveProfile({ rationCardNumber, headOfFamily, members });
      onProfileUpdate(res.data);
      setStatus({ type: 'success', message: 'Household profile securely updated in MongoDB.' });
    } catch (err) {
      setStatus({ type: 'error', message: err });
    }
  };

  const updateMember = (idx, field, val) => {
    const updated = [...members];
    updated[idx][field] = val;
    setMembers(updated);
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-[#1A365D]">Manage Family Information</h2>
        <p className="text-xs text-slate-500">Provide accurate identity references to automatically evaluate distribution limits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ration Card Document ID</label>
          <input type="text" value={rationCardNumber} onChange={(e) => setRationCardNumber(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g., RC-991823" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Head of Family Representative</label>
          <input type="text" value={headOfFamily} onChange={(e) => { setHeadOfFamily(e.target.value); updateMember(0, 'name', e.target.value); }} required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g., Ram Charan" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1"><Users size={14} /> Dependents Registry Grid</label>
          <button type="button" onClick={() => setMembers([...members, { name: '', age: '', role: 'Member' }])} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-0.5"><Plus size={10}/> Add Member Row</button>
        </div>

        {members.map((m, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
            <input type="text" placeholder="Full Name" value={m.name} required onChange={(e) => updateMember(idx, 'name', e.target.value)} className="flex-1 p-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-600" />
            <input type="number" placeholder="Age" value={m.age} required onChange={(e) => updateMember(idx, 'age', e.target.value)} className="w-16 p-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-600" />
            <select value={m.role} onChange={(e) => updateMember(idx, 'role', e.target.value)} className="w-24 p-1.5 border border-slate-200 bg-white rounded-lg text-xs outline-none text-slate-600">
              <option value="Head">Head</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Member">Member</option>
            </select>
            {idx > 0 && <button type="button" onClick={() => setMembers(members.filter((_, i) => i !== idx))} className="text-red-500 p-1 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>}
          </div>
        ))}
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span>{status.message}</span>
        </div>
      )}

      <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition uppercase shadow-md shadow-emerald-50">Save Profiles Changes</button>
    </form>
  );
}