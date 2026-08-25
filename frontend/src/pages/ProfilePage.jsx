import React, { useState, useEffect, useRef } from 'react';
import {
  User, Users, IdCard, Plus, Trash2, Pencil, CheckCircle2, AlertCircle, Info, Loader2,
  MapPin, Camera, Save, Phone, Mail, ShieldAlert,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge, colorForText } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { useAccount } from '../context/AccountContext';
import { API_URL } from '../services/api';
import { computeTotalQuotaKg } from '../utils/ration';

const emptyMember = () => ({ name: '', age: '', relation: '' });

export default function ProfilePage({ onAccountDeleted }) {
  const { refresh: refreshAccount } = useAccount();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Account details (the person who owns this login)
  const [accountName, setAccountName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [rowErrors, setRowErrors] = useState({});

  // Ration card / household details
  const [card, setCard] = useState('');
  const [head, setHead] = useState('');
  const [address, setAddress] = useState({ village: '', block: '', district: '', state: '', pincode: '' });
  const [members, setMembers] = useState([emptyMember()]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ration_user_token');
    if (!token) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(API_URL + '/auth/me', { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch(API_URL + '/family/profile', { headers }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([account, profile]) => {
        if (account) {
          setAccountName(account.name || '');
          setAvatar(account.avatar || null);
          setPhone(account.phone || '');
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

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setMsg({ error: 'Please choose an image smaller than 1.5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([...members, emptyMember()]);
    setEditingIndex(members.length);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setEditingIndex(null);
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
        fetch(API_URL + '/auth/me', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name: accountName, avatar, phone: phone.replace(/\s+/g, '') }),
        }),
        fetch(API_URL + '/family/profile', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            rationCardNumber: card,
            headOfFamily: head,
            address,
            members: members.map((m) => ({ ...m, age: Number(m.age) || 0, relation: m.relation?.trim() || 'Dependent' })),
          }),
        }),
      ]);

      const accountData = await accountRes.json();
      const familyData = await familyRes.json();

      if (!accountRes.ok) throw new Error(accountData.message || 'Failed to save account details.');
      if (!familyRes.ok) throw new Error(familyData.message || 'Failed to save household details.');

      setMsg({ success: 'Your account and household profile were saved successfully.' });
      setEditingIndex(null);
      refreshAccount(); // keep the top-bar avatar/name/card chip in sync everywhere
    } catch (err) {
      setMsg({ error: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Permanently deletes the account. The UI signs out INSTANTLY (optimistic)
  // while the delete request runs in the background — no waiting on the
  // network round-trip.
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? Your account and profile will be permanently deleted.')) {
      return;
    }

    // Sign out first so the user sees an immediate response
    onAccountDeleted && onAccountDeleted();

    // Fire-and-forget deletion; aborted if the server hangs
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const token = localStorage.getItem('ration_user_token');
      await fetch(API_URL + '/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
    } catch {
      // Account cleanup failed server-side — nothing sensible to show the
      // user here since they are already signed out.
    } finally {
      clearTimeout(timeout);
    }
  };

  // Strictly consider only the total members mentioned in the Family Members section
  const validMembersCount = members.filter((m) => m.name?.trim()).length;
  const totalMembers = validMembersCount > 0 ? validMembersCount : 1;
  // Shared rule: max(35 kg floor, 10 kg per member)
  const estimatedGrainsKg = computeTotalQuotaKg(totalMembers);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-24 text-center text-slate-400 text-sm font-medium">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Family Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account, family members and get accurate ration entitlement.
          </p>
        </div>
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 max-w-sm">
          <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-700">Coming soon: Family auto-sync</p>
            <p className="text-[11px] text-blue-600 mt-0.5">
              We'll soon fetch your family members automatically from your ration card.
            </p>
          </div>
        </div>
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
        {/* Top row: Account / Ration card / Address */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <User size={16} className="text-blue-600" />
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                  aria-label="Change profile picture"
                >
                  <Avatar src={avatar} name={accountName} size={56} />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white">
                    <Camera size={12} />
                  </span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
                <p className="text-xs text-slate-400">Click to upload a profile picture (max 1.5MB).</p>
              </div>

              <div>
                <Label htmlFor="accountName">Full Name</Label>
                <Input
                  id="accountName"
                  className="mt-1"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountPhone">
                  <span className="flex items-center gap-1.5"><Phone size={12} /> Phone Number</span>
                </Label>
                <Input
                  id="accountPhone"
                  className="mt-1"
                  type="tel"
                  maxLength={12}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98765 43210"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Link your mobile number to enable OTP login for this account.
                </p>
              </div>
              <div>
                <Label>
                  <span className="flex items-center gap-1.5"><Mail size={12} /> Registered Email</span>
                </Label>
                <Input className="mt-1 bg-slate-100 text-slate-500" value={email || 'Not set'} disabled />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> This is tied to how you log in and can't be changed here.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <IdCard size={16} className="text-blue-600" />
              <CardTitle>Ration Card Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="card">Ration Card ID</Label>
                <Input id="card" className="mt-1" value={card} onChange={(e) => setCard(e.target.value)} placeholder="e.g. 122341" required />
              </div>
              <div>
                <Label htmlFor="head">Head of Family</Label>
                <Input id="head" className="mt-1" value={head} onChange={(e) => setHead(e.target.value)} placeholder="Full name" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin size={16} className="text-blue-600" />
              <div>
                <CardTitle>Address / Location</CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">This determines your local distributor.</p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Village / Town</Label>
                <Input className="mt-1" value={address.village} onChange={(e) => setAddress({ ...address, village: e.target.value })} required />
              </div>
              <div>
                <Label>Tehsil</Label>
                <Input className="mt-1" value={address.block} onChange={(e) => setAddress({ ...address, block: e.target.value })} />
              </div>
              <div>
                <Label>District</Label>
                <Input className="mt-1" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} required />
              </div>
              <div>
                <Label>State</Label>
                <Input className="mt-1" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
              </div>
              <div>
                <Label>PIN Code</Label>
                <Input className="mt-1" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family members + ration estimate side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <Card>
            <CardHeader className="justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <CardTitle>Family Members ({members.length})</CardTitle>
              </div>
              <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={addMember}>
                <Plus size={14} /> Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                  No additional members added yet. Only the head of family will be on record.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-200">
                      <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                      <th scope="col" className="py-2 pr-3 font-semibold w-16">Age</th>
                      <th scope="col" className="py-2 pr-3 font-semibold w-32">Relation</th>
                      <th scope="col" className="py-2 w-16"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => {
                      const isEditing = editingIndex === i;
                      return (
                        <React.Fragment key={i}>
                          <tr className="border-b border-slate-100 last:border-0">
                            {isEditing ? (
                              <>
                                <td className="py-2 pr-3">
                                  <Input value={m.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder="Full name" aria-label={`Name of member ${i + 1}`} />
                                </td>
                                <td className="py-2 pr-3">
                                  <Input type="number" min="0" value={m.age} onChange={(e) => updateMember(i, 'age', e.target.value)} placeholder="Age" aria-label={`Age of member ${i + 1}`} />
                                </td>
                                <td className="py-2 pr-3">
                                  <Input value={m.relation} onChange={(e) => updateMember(i, 'relation', e.target.value)} placeholder="e.g. Mother" aria-label={`Relation to head of family for member ${i + 1}`} />
                                </td>
                                <td className="py-2 text-right">
                                  <button type="button" onClick={() => setEditingIndex(null)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg cursor-pointer" aria-label="Done editing">
                                    <CheckCircle2 size={16} />
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-2.5 pr-3">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar name={m.name || `Member ${i + 1}`} size={28} />
                                    <span className="font-medium text-slate-800">{m.name || <span className="text-slate-400 italic">Unnamed</span>}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 pr-3 text-slate-600">{m.age || '—'}</td>
                                <td className="py-2.5 pr-3">
                                  {m.relation ? (
                                    <Badge className={colorForText(m.relation)}>{m.relation}</Badge>
                                  ) : (
                                    <span className="text-slate-400 text-xs italic">Not set</span>
                                  )}
                                </td>
                                <td className="py-2.5 text-right whitespace-nowrap">
                                  <button type="button" onClick={() => setEditingIndex(i)} aria-label={`Edit member ${i + 1}`} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                                    <Pencil size={15} />
                                  </button>
                                  <button type="button" onClick={() => removeMember(i)} aria-label={`Remove member ${i + 1}`} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                          {rowErrors[i] && (
                            <tr>
                              <td colSpan={4} className="pb-2">
                                <p className="text-[11px] text-red-600 font-medium">{rowErrors[i]}</p>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <button
                type="button"
                onClick={addMember}
                className="w-full mt-4 flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={16} />
                Add Another Family Member
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <IdCard size={16} className="text-blue-600" />
              <CardTitle>Estimated Monthly Ration ({totalMembers} Members)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Food grains (rice / wheat / coarse grains)</span>
                <span className="text-lg font-bold text-slate-900">{estimatedGrainsKg} kg</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-start gap-1.5">
                <Info size={12} className="shrink-0 mt-0.5" />
                <span>This is an estimate based on household size. Your official quota is confirmed on the Terminal Hub.</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Button type="submit" variant="success" disabled={saving} className="w-full h-12 text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      {/* Danger zone — permanent account removal */}
      <Card className="border-red-200">
        <CardHeader>
          <ShieldAlert size={16} className="text-red-600" />
          <div>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deleting your account removes your login and profile permanently. This cannot be undone.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="destructive" onClick={handleDeleteAccount} className="h-10 px-4 text-xs">
            <Trash2 size={14} />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-200 pt-6 pb-2">
        <span>© {new Date().getFullYear()} Government of India</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms of Use</span>
          <span className="hover:text-slate-600 cursor-pointer">Accessibility Statement</span>
        </div>
      </footer>
    </div>
  );
}
