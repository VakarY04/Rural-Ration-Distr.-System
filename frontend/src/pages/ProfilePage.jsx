import React, { useState, useEffect } from 'react';
import {
  User, Users, IdCard, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, Loader2, MapPin,
} from 'lucide-react';

const RELATION_OPTIONS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];

const [address, setAddress] = useState({ village: '', block: '', district: '', state: '', pincode: '' });

// Mirrors backend/services/rationCalculator.js — used here only to show a
// live preview as the household size changes. The backend figure (shown on
// the Terminal Hub) is always the source of truth.
const PER_MEMBER_RATES = { rice: 5, grains: 3, pulses: 1.5, oil: 0.5 };

const emptyMember = () => ({ name: '', age: '', relation: 'Child' });

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  // Account details (the person who owns this login)
  const [accountName, setAccountName] = useState('');
  const [phone, setPhone] = useState(null);
  const [email, setEmail] = useState(null);

  // Ration card / household details
  const [card, setCard] = useState('');
  const [head, setHead] = useState('');
  const [members, setMembers] = useState([emptyMember()]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [rowErrors, setRowErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('ration_user_token');
    if (!token) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:5000/api/auth/me', { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch('http://localhost:5000/api/family/profile', { headers }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([account, profile]) => {
        if (account) {
          setAccountName(account.name || '');
          setPhone(account.phone);
          setEmail(account.email);
        }
        if (profile) {
          setCard(profile.rationCardNumber || '');
          setHead(profile.headOfFamily || '');
          setMembers(profile.members?.length ? profile.members : [emptyMember()]);
          if (profile.address) setAddress(profile.address);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addMember = () => setMembers([...members, emptyMember()]);

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const validateMembers = () => {
    const errors = {};
    members.forEach((m, i) => {
      if (!m.name?.trim() || m.age === '' || m.age === null || Number(m.age) < 0) {
        errors[i] = 'Add a name and a valid age for this member, or remove the row.';
      }
    });
    setRowErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ error: '', success: '' });

    if (!validateMembers()) {
      setMsg({ error: 'Please fix the highlighted family member row(s) before saving.' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('ration_user_token');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      const [accountRes, familyRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/me', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name: accountName }),
        }),
        fetch('http://localhost:5000/api/family/profile', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            rationCardNumber: card,
            headOfFamily: head,
            address,
            members: members.map((m) => ({ ...m, age: Number(m.age) || 0 })),
          }),
        }),
      ]);

      const accountData = await accountRes.json();
      const familyData = await familyRes.json();

      if (!accountRes.ok) throw new Error(accountData.message || 'Failed to save account details.');
      if (!familyRes.ok) throw new Error(familyData.message || 'Failed to save household details.');

      setMsg({ success: 'Your account and household profile were saved successfully.' });
    } catch (err) {
      setMsg({ error: err.message });
    } finally {
      setSaving(false);
    }
  };

  const totalMembers = members.filter((m) => m.name?.trim()).length + 1; // +1 for head of family
  const estimatedQuota = {
    rice: (PER_MEMBER_RATES.rice * totalMembers).toFixed(1),
    grains: (PER_MEMBER_RATES.grains * totalMembers).toFixed(1),
    pulses: (PER_MEMBER_RATES.pulses * totalMembers).toFixed(1),
    oil: (PER_MEMBER_RATES.oil * totalMembers).toFixed(1),
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400 text-sm font-medium">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Family profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your account and household details up to date so we can calculate the right ration quota.
        </p>
      </div>

      {msg.error && (
        <div className="flex items-start gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{msg.error}</span>
        </div>
      )}
      {msg.success && (
        <div className="flex items-start gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{msg.success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account details */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Your account details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountName" className="text-xs font-semibold text-slate-500">Your name</label>
              <input
                id="accountName"
                className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">
                {phone ? 'Registered phone number' : 'Registered email'}
              </label>
              <input
                className="w-full mt-1 bg-slate-100 border border-slate-200 p-3 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                value={phone || email || 'Not set'}
                disabled
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This is tied to how you log in and can't be changed here.
              </p>
            </div>
          </div>
        </section>

        {/* Ration card details */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <IdCard size={16} className="text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Ration card details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="card" className="text-xs font-semibold text-slate-500">Ration card ID</label>
              <input
                id="card"
                className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                placeholder="e.g. RC-98217"
                required
              />
            </div>
            <div>
              <label htmlFor="head" className="text-xs font-semibold text-slate-500">Head of family</label>
              <input
                id="head"
                className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                value={head}
                onChange={(e) => setHead(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Address / location</h2>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Your ration is distributed from the depot serving this area, so please keep it accurate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              value={address.village}
              onChange={(e) => setAddress({ ...address, village: e.target.value })}
              placeholder="Village / town"
              required
            />
            <input
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              value={address.block}
              onChange={(e) => setAddress({ ...address, block: e.target.value })}
              placeholder="Block / tehsil (optional)"
            />
            <input
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              value={address.district}
              onChange={(e) => setAddress({ ...address, district: e.target.value })}
              placeholder="District"
              required
            />
            <input
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              placeholder="State"
              required
            />
            <input
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 md:col-span-2"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              placeholder="Pincode (optional)"
            />
          </div>
        </section>

        {/* Future scope: AI ration card scan */}
        <div className="flex items-center gap-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4">
          <Sparkles size={18} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500">
            <strong className="text-slate-600">Coming soon:</strong> scan your ration card and we'll fill in your
            family members automatically. This needs government API access we don't have yet, so for now please
            add members manually below.
          </p>
        </div>

        {/* Family members */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Family members ({members.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus size={15} />
              Add member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
              No additional members added yet. Only the head of family will be on record.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-200">
                    <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                    <th scope="col" className="py-2 pr-3 font-semibold w-24">Age</th>
                    <th scope="col" className="py-2 pr-3 font-semibold w-40">Relation</th>
                    <th scope="col" className="py-2 w-10"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <React.Fragment key={i}>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-3">
                          <input
                            aria-label={`Name of member ${i + 1}`}
                            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            value={m.name}
                            onChange={(e) => updateMember(i, 'name', e.target.value)}
                            placeholder="Full name"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            aria-label={`Age of member ${i + 1}`}
                            type="number"
                            min="0"
                            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            value={m.age}
                            onChange={(e) => updateMember(i, 'age', e.target.value)}
                            placeholder="Age"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            aria-label={`Relation of member ${i + 1}`}
                            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            value={m.relation}
                            onChange={(e) => updateMember(i, 'relation', e.target.value)}
                          >
                            {RELATION_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            aria-label={`Remove member ${i + 1}`}
                            className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                      {rowErrors[i] && (
                        <tr>
                          <td colSpan={4} className="pb-2">
                            <p className="text-[11px] text-red-600 font-medium">{rowErrors[i]}</p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={addMember}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add another family member
          </button>
        </section>

        {/* Live quota preview */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
            Estimated monthly ration ({totalMembers} member{totalMembers === 1 ? '' : 's'})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{estimatedQuota.rice} kg</p>
              <p className="text-[11px] text-slate-400">Rice</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{estimatedQuota.grains} kg</p>
              <p className="text-[11px] text-slate-400">Grains</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{estimatedQuota.pulses} kg</p>
              <p className="text-[11px] text-slate-400">Pulses</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{estimatedQuota.oil} L</p>
              <p className="text-[11px] text-slate-400">Oil</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            This is an estimate based on household size. Your official quota is confirmed on the Terminal Hub.
          </p>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}