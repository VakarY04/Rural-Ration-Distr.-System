import React, { useState, useEffect } from 'react';
import { User, Shield, Plus, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [members, setMembers] = useState([
    { name: '', age: '', relation: 'Head' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Existing Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('ration_user_token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/family/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.rationCardNumber) setRationCardNumber(data.rationCardNumber);
          if (data.headOfFamily) setHeadOfFamily(data.headOfFamily);
          if (Array.isArray(data.members) && data.members.length > 0) {
            setMembers(data.members.map(m => ({
              name: m.name || '',
              age: m.age || '',
              relation: m.relation || m.role || m.relationship || 'Head'
            })));
          }
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };

    fetchProfile();
  }, []);

  // Handle Dynamic Member Inputs
  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMemberRow = () => {
    setMembers([...members, { name: '', age: '', relation: 'Dependent' }]);
  };

  const removeMemberRow = (index) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('ration_user_token');

      // ✅ SANITIZE MEMBERS PAYLOAD TO MATCH MONGOOSE SCHEMA EXACTLY
      const sanitizedMembers = members.map(m => ({
        name: m.name.trim(),
        age: Number(m.age) || 0,
        relation: m.relation || m.role || m.relationship || 'Head'
      }));

      const profileData = {
        rationCardNumber: rationCardNumber.trim(),
        headOfFamily: headOfFamily.trim(),
        members: sanitizedMembers
      };

      const response = await fetch('http://localhost:5000/api/family/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile changes saved successfully!');
      } else {
        setError(data.message || 'Failed to save family profile.');
      }
    } catch (err) {
      console.error('Save Profile Error:', err);
      setError(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Manage Family Information</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Provide accurate identity references to automatically evaluate distribution limits.
          </p>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{typeof error === 'string' ? error : 'An unexpected error occurred'}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Main Card Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Ration Card Document ID
              </label>
              <input 
                type="text" 
                required 
                value={rationCardNumber} 
                onChange={(e) => setRationCardNumber(e.target.value)} 
                placeholder="e.g. RC-991823"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Head of Family Representative
              </label>
              <input 
                type="text" 
                required 
                value={headOfFamily} 
                onChange={(e) => setHeadOfFamily(e.target.value)} 
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Members Registry Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} />
                <span>Dependents Registry Grid</span>
              </label>
              <button 
                type="button" 
                onClick={addMemberRow}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Member Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <input 
                    type="text" 
                    required 
                    placeholder="Member Name" 
                    value={member.name} 
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input 
                    type="number" 
                    required 
                    placeholder="Age" 
                    value={member.age} 
                    onChange={(e) => handleMemberChange(index, 'age', e.target.value)}
                    className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <select 
                    value={member.relation} 
                    onChange={(e) => handleMemberChange(index, 'relation', e.target.value)}
                    className="w-32 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Head">Head</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </select>

                  {members.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMemberRow(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-4 rounded-2xl transition duration-200 shadow-lg uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={16} />
            <span>{loading ? 'Saving Changes...' : 'Save Profiles Changes'}</span>
          </button>

        </form>
      </div>
    </div>
  );
}