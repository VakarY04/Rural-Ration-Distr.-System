import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, Loader2, Save } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { useLanguage } from '../i18n/LanguageContext';
import { API_URL } from '../services/api';
import { computeTotalQuotaKg } from '../utils/ration';
import { swissUser as swiss } from '../components/ui/swiss';
import { AccountPanel, RationCardPanel, AddressPanel } from './profile/ProfilePanels';
import { MembersPanel, QuotaPanel, DangerZonePanel } from './profile/ProfileMembers';

const emptyMember = () => ({ name: '', age: '' });

export default function ProfilePage({ onAccountDeleted }) {
  const { refresh: refreshAccount } = useAccount();
  const { t } = useLanguage();
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
      setMsg({ error: t('profile.avatarTooBig') });
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
        errors[i] = t('profile.rowInvalid');
      }
    });
    setRowErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ error: '', success: '' });

    if (!validateMembers()) {
      setMsg({ error: t('profile.fixRows') });
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
            members: members.map((m) => ({ name: m.name?.trim() || '', age: Number(m.age) || 0 })),
          }),
        }),
      ]);

      const accountData = await accountRes.json();
      const familyData = await familyRes.json();

      if (!accountRes.ok) throw new Error(accountData.message || t('profile.saveAccountFailed'));
      if (!familyRes.ok) throw new Error(familyData.message || t('profile.saveHouseholdFailed'));

      setMsg({ success: t('profile.saved') });
      setEditingIndex(null);
      refreshAccount(); // keep the top-bar avatar/name/card chip in sync everywhere
    } catch (err) {
      setMsg({ error: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('profile.deleteConfirm'))) {
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
        <p className={swiss.micro}>{t('profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 font-sans">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className={swiss.micro}>{t('profile.eyebrow')}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className={swiss.headline}>{t('profile.title')}</h1>
          </div>
        </div>
        <div className="flex items-start gap-2 bg-[#0D6EFD]/10 border border-[#0D6EFD]/30 px-4 py-3 max-w-sm">
          <Info size={16} className="text-[#0D6EFD] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#0D6EFD]">{t('profile.autoSyncTitle')}</p>
            <p className="text-[11px] text-[#0D6EFD] mt-0.5">
              {t('profile.autoSyncBody')}
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

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
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
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
      </form>

      <DangerZonePanel onDelete={handleDeleteAccount} />
    </div>
  );
}
