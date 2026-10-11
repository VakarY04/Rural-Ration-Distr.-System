import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { swissUser as swiss } from '../ui/swiss';
import { useArrowNav } from '../../hooks/useArrowNav';
import { useLanguage } from '../../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';
const inputClass =
  'border border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-300 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none transition-colors';

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'distributor', shopId: '' };

// Staff provisioning (admin only) — roster of registry-provisioned accounts
// with a provision form and two-step removal. Backend is authoritative
// (requireAdmin); removed accounts stop passing the staff gateway at once.
export default function StaffPanel() {
  const { t } = useLanguage();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [removing, setRemoving] = useState('');
  // Arrows move between rows via their action buttons (Up/Down/Home/End).
  const rowsRef = useArrowNav('vertical');

  const load = useCallback(() => {
    setError('');
    return api('/staff')
      .then((data) => setStaff(data.staff || []))
      .catch((e) => setError(e.message || t('roster.failed')));
  }, [t]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setFormError('');
    setNotice('');
  };

  const provision = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError('');
    setNotice('');
    try {
      await api('/staff', 'POST', form);
      setForm(emptyForm);
      setNotice(t('roster.provisioned'));
      await load();
    } catch (err) {
      setFormError(err.message || t('roster.failed'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (email) => {
    if (removing) return;
    setRemoving(email);
    setNotice('');
    try {
      await api(`/staff/${encodeURIComponent(email)}`, 'DELETE');
      setConfirmEmail('');
      setNotice(t('roster.removed'));
      await load();
    } catch (err) {
      setNotice(err.message || t('roster.failed'));
    } finally {
      setRemoving('');
    }
  };

  const roleLabel = (r) => (r === 'admin' ? t('roster.roleAdmin') : t('roster.roleDistributor'));

  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('roster.eyebrow')}</p>
        <h1 className={`${swiss.headline} flex items-center gap-2.5`}>
          <span className="w-9 h-9 border border-slate-900/20 bg-slate-900/5 text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0" aria-hidden="true">
            <Users size={17} />
          </span>
          {t('roster.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t('roster.intro')}</p>
      </header>

      {loading && (
        <p className="py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
      )}

      {!loading && error && (
        <div role="alert" className="border border-[#DC3545]/30 bg-[#DC3545]/10 text-[#DC3545] dark:text-red-400 p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            {staff.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t('roster.empty')}</p>
            ) : (
              <div ref={rowsRef} className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <th scope="col" className="px-4 py-3 font-bold">{t('roster.name')}</th>
                      <th scope="col" className="px-4 py-3 font-bold">{t('roster.email')}</th>
                      <th scope="col" className="px-4 py-3 font-bold">{t('roster.phone')}</th>
                      <th scope="col" className="px-4 py-3 font-bold">{t('roster.role')}</th>
                      <th scope="col" className="px-4 py-3 font-bold">{t('roster.shop')}</th>
                      <th scope="col" className="px-4 py-3"><span className="sr-only">{t('roster.deprovision')}</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.email} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 break-words">{s.name}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 break-all">{s.email}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${s.role === 'admin' ? 'border-black/30 bg-black/5 text-black dark:text-slate-100' : 'border-[#198754]/30 bg-[#198754]/10 text-[#198754] dark:text-emerald-400'}`}>
                            {roleLabel(s.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.shopId || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          {confirmEmail === s.email ? (
                            <span className="inline-flex items-center gap-2 flex-wrap justify-end">
                              <span className="text-xs text-slate-600 dark:text-slate-300">{t('roster.confirmRemove', { email: s.email })}</span>
                              <button
                                type="button"
                                data-arrow-item
                                disabled={removing === s.email}
                                onClick={() => remove(s.email)}
                                className={`bg-[#DC3545] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 cursor-pointer disabled:opacity-50 ${FOCUS}`}
                              >
                                {t('roster.confirmYes')}
                              </button>
                              <button
                                type="button"
                                data-arrow-item
                                onClick={() => setConfirmEmail('')}
                                className={`border border-slate-300 dark:border-slate-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 cursor-pointer ${FOCUS}`}
                              >
                                {t('roster.cancel')}
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              data-arrow-item
                              onClick={() => setConfirmEmail(s.email)}
                              aria-label={`${t('roster.deprovision')} ${s.email}`}
                              title={`${t('roster.deprovision')} ${s.email}`}
                              className={`inline-flex items-center gap-1 text-[#DC3545] hover:bg-[#DC3545]/10 text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 cursor-pointer ${FOCUS}`}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                              {t('roster.deprovision')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus size={16} aria-hidden="true" />
              {t('roster.provisionTitle')}
            </h2>
            <form onSubmit={provision} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('roster.name')}</span>
                <input required value={form.name} onChange={set('name')} maxLength={80} className={`${inputClass} w-full`} autoComplete="off" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('roster.email')}</span>
                <input required type="email" value={form.email} onChange={set('email')} maxLength={120} className={`${inputClass} w-full`} autoComplete="off" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('roster.phone')}</span>
                <input required value={form.phone} onChange={set('phone')} inputMode="numeric" maxLength={15} className={`${inputClass} w-full`} autoComplete="off" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('roster.password')}</span>
                <input required type="password" value={form.password} onChange={set('password')} minLength={8} maxLength={72} className={`${inputClass} w-full`} autoComplete="new-password" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('roster.role')}</span>
                <select value={form.role} onChange={set('role')} className={`${inputClass} w-full cursor-pointer`}>
                  <option value="distributor">{t('roster.roleDistributor')}</option>
                  <option value="admin">{t('roster.roleAdmin')}</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('roster.shop')}</span>
                <input required value={form.shopId} onChange={set('shopId')} maxLength={24} placeholder="FPS-1001" className={`${inputClass} w-full`} autoComplete="off" />
                <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t('roster.shopHint')}</span>
              </label>
              <div className="sm:col-span-2 flex items-center gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer disabled:opacity-50 ${FOCUS}`}
                >
                  {t('roster.submit')}
                </button>
                {formError && <p role="alert" className="text-sm font-medium text-[#DC3545] dark:text-red-400">{formError}</p>}
                {notice && <p role="status" className="text-sm font-medium text-[#198754] dark:text-emerald-400">{notice}</p>}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
