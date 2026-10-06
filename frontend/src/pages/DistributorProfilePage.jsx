import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, Loader2, Save, ShieldCheck } from 'lucide-react';
import { swissUser as swiss } from '../components/ui/swiss';
import { Avatar } from '../components/ui/avatar';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';

const EMPTY_ADDRESS = { village: '', block: '', district: '', state: '', pincode: '' };

// Staff profile — editable by its owner only. Admins edit their own profile,
// distributors edit their own (PUT /auth/me is scoped to the signed-in
// account, so no role can touch another role's record). Fields: name, role
// (read-only), profile pic, phone, email (read-only) + home address.
export default function DistributorProfilePage({ name, role, isAdmin, summary, onSaved }) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });

  const [displayName, setDisplayName] = useState(name || '');
  const [avatar, setAvatar] = useState(summary?.avatar || null);
  const [phone, setPhone] = useState(summary?.phone || '');
  const [email, setEmail] = useState(summary?.email || null);
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, ...(summary?.address || {}) });

  useEffect(() => {
    let active = true;
    api('/auth/me')
      .then((me) => {
        if (!active || !me) return;
        setDisplayName(me.name || name || '');
        setAvatar(me.avatar || null);
        setPhone(me.phone || '');
        setEmail(me.email ?? null);
        setAddress({ ...EMPTY_ADDRESS, ...(me.address || {}) });
      })
      .catch(() => {
        // Fall back to console-summary props when the direct read fails
        // (e.g. transient network) — the form stays usable.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setMsg({ error: t('staffProfile.avatarTooBig'), success: '' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setMsg({ error: '', success: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ error: '', success: '' });
    if (!displayName.trim()) {
      setMsg({ error: t('staffProfile.nameRequired'), success: '' });
      return;
    }
    setSaving(true);
    try {
      const updated = await api('/auth/me', 'PUT', {
        name: displayName.trim(),
        avatar,
        phone: (phone || '').replace(/\s+/g, ''),
        address,
      });
      setDisplayName(updated.name || displayName);
      setAvatar(updated.avatar || null);
      setPhone(updated.phone || '');
      setAddress({ ...EMPTY_ADDRESS, ...(updated.address || {}) });
      try {
        localStorage.setItem('ration_user_name', updated.name || displayName);
      } catch {
        // Private mode — display name simply doesn't persist.
      }
      setMsg({ error: '', success: t('staffProfile.saved') });
      onSaved?.();
    } catch (err) {
      setMsg({ error: err.message || t('staffProfile.saveFailed'), success: '' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className={swiss.micro}>{t('staffProfile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('staff.eyebrow')}</p>
        <h1 className={swiss.headline}>{isAdmin ? t('staffProfile.titleAdmin') : t('staffProfile.titleDistributor')}</h1>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Identity card — name + role + profile pic */}
        <section className={swiss.panel}>
          <div className="border-b border-slate-100 p-5">
            <h2 className={swiss.sectionTitle}>{t('staffProfile.identityTitle')}</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                title={t('staffProfile.changePic')}
                aria-label={t('staffProfile.changePic')}
              >
                <Avatar src={avatar} name={displayName} size={64} />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white">
                  <Camera size={12} />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">{displayName || name}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-0.5">
                  {t('staff.portalSuffix', { role: role || t('staff.fallback') })}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">{t('staffProfile.uploadHint')}</p>

            <div>
              <label htmlFor="staffName" className={swiss.label}>{t('staffProfile.fullName')}</label>
              <input
                id="staffName"
                className={swiss.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('staffProfile.fullNamePh')}
                required
              />
            </div>

            <div>
              <span className={swiss.label}>
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> {t('staffProfile.role')}</span>
              </span>
              <input className={`${swiss.input} disabled:bg-slate-100 disabled:text-slate-500`} value={role || t('staff.fallback')} disabled />
              <p className="text-[11px] text-slate-500 mt-1.5">{t('staffProfile.roleHint')}</p>
            </div>
          </div>
        </section>

        {/* Contact card — phone editable, email read-only */}
        <section className={swiss.panel}>
          <div className="border-b border-slate-100 p-5">
            <h2 className={swiss.sectionTitle}>{t('staffProfile.contactTitle')}</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="staffPhone" className={swiss.label}>{t('staffProfile.phone')}</label>
              <input
                id="staffPhone"
                className={swiss.input}
                type="tel"
                maxLength={12}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('staffProfile.phonePh')}
              />
              <p className="text-[11px] text-slate-500 mt-1.5">{t('staffProfile.phoneHint')}</p>
            </div>
            <div>
              <span className={swiss.label}>{t('staffProfile.email')}</span>
              <input className={`${swiss.input} disabled:bg-slate-100 disabled:text-slate-500`} value={email || t('staffProfile.notSet')} disabled />
              <p className="text-[11px] text-slate-500 mt-1.5">{t('staffProfile.emailHint')}</p>
            </div>
          </div>
        </section>

        {/* Home address card */}
        <section className={swiss.panel}>
          <div className="border-b border-slate-100 p-5">
            <h2 className={swiss.sectionTitle}>{t('staffProfile.addressTitle')}</h2>
            <p className="text-[11px] text-slate-500 mt-1">{t('staffProfile.addressHint')}</p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor="staffVillage" className={swiss.label}>{t('profile.address.village')}</label>
              <input
                id="staffVillage"
                className={swiss.input}
                value={address.village}
                onChange={(e) => setAddress({ ...address, village: e.target.value })}
                placeholder={t('staffProfile.villagePh')}
              />
            </div>
            <div>
              <label htmlFor="staffBlock" className={swiss.label}>{t('profile.address.tehsil')}</label>
              <input
                id="staffBlock"
                className={swiss.input}
                value={address.block}
                onChange={(e) => setAddress({ ...address, block: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="staffDistrict" className={swiss.label}>{t('profile.address.district')}</label>
              <input
                id="staffDistrict"
                className={swiss.input}
                value={address.district}
                onChange={(e) => setAddress({ ...address, district: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="staffState" className={swiss.label}>{t('profile.address.state')}</label>
              <input
                id="staffState"
                className={swiss.input}
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="staffPincode" className={swiss.label}>{t('profile.address.pin')}</label>
              <input
                id="staffPincode"
                className={swiss.input}
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                inputMode="numeric"
              />
            </div>
          </div>
        </section>

        <div className="lg:col-span-3">
          <button type="submit" disabled={saving} className={`${swiss.btnPrimary} w-full`}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? t('staffProfile.saving') : t('staffProfile.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
