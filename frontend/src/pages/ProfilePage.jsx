import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, Loader2, Save } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { API_URL } from '../services/api';
import { computeTotalQuotaKg } from '../utils/ration';
import { swiss } from '../components/ui/swiss';
import { AccountPanel, RationCardPanel, AddressPanel } from './profile/ProfilePanels';
import { MembersPanel, QuotaPanel, DangerZonePanel } from './profile/ProfileMembers';

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
      Promise.resolve().then(() => setLoading(false));
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

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? Your account and profile will be permanently deleted.')) {
      return;
    }

    onAccountDeleted && onAccountDeleted();

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

  const validMembersCount = members.filter((m) => m.name?.trim()).length;
  const totalMembers = validMembersCount > 0 ? validMembersCount : 1;
  const estimatedGrainsKg = computeTotalQuotaKg(totalMembers);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-24 text-center">
        <p className={swiss.micro}>Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className={swiss.micro}>Citizen records</p>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className={swiss.headline}>Family Profile</h1>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Manage your account, family members and get accurate ration entitlement.
          </p>
        </div>
        <div className="flex items-start gap-2 bg-[#0D6EFD]/10 border border-[#0D6EFD]/30 px-4 py-3 max-w-sm">
          <Info size={16} className="text-[#0D6EFD] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#0D6EFD]">Coming soon: Family auto-sync</p>
            <p className="text-[11px] text-[#0D6EFD] mt-0.5">
              We'll soon fetch your family members automatically from your ration card.
            </p>
          </div>
        </div>
      </header>

      {msg.error && (
        <div className="flex items-start gap-2 text-sm font-medium text-[#DC3545] bg-[#DC3545]/10 border border-[#DC3545]/30 p-4">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{msg.error}</span>
        </div>
      )}
      {msg.success && (
        <div className="flex items-start gap-2 text-sm font-medium text-[#198754] bg-[#198754]/10 border border-[#198754]/30 p-4">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{msg.success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <AccountPanel
            fileInputRef={fileInputRef}
            avatar={avatar}
            accountName={accountName}
            onNameChange={(e) => setAccountName(e.target.value)}
            phone={phone}
            onPhoneChange={(e) => setPhone(e.target.value)}
            email={email}
            onAvatarPick={handleAvatarPick}
          />
          <RationCardPanel card={card} onCardChange={(e) => setCard(e.target.value)} head={head} onHeadChange={(e) => setHead(e.target.value)} />
          <AddressPanel address={address} setAddress={setAddress} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <MembersPanel
            members={members}
            editingIndex={editingIndex}
            rowErrors={rowErrors}
            updateMember={updateMember}
            setEditingIndex={setEditingIndex}
            removeMember={removeMember}
            addMember={addMember}
          />
          <QuotaPanel totalMembers={totalMembers} estimatedGrainsKg={estimatedGrainsKg} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`${swiss.btnPrimary} w-full`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <DangerZonePanel onDelete={handleDeleteAccount} />

      <footer className="border-t border-slate-200 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className={swiss.micro}>© {new Date().getFullYear()} Government of India</p>
        <div className={`flex items-center gap-4 ${swiss.micro}`}>
          <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms of Use</span>
          <span className="hover:text-slate-600 cursor-pointer">Accessibility Statement</span>
        </div>
      </footer>
    </div>
  );
}
