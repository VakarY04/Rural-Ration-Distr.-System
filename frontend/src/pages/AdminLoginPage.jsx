import { useState } from 'react';
import { Users, Building2, ShieldCheck, ArrowLeft } from 'lucide-react';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import AuthMethodTabs from '../components/auth/AuthMethodTabs';
import AuthEmailForm from '../components/auth/AuthEmailForm';
import AuthOtpForm from '../components/auth/AuthOtpForm';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';
import SkipLink from '../components/SkipLink';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

export default function AdminLoginPage({ onNavigate, onAuthSuccess }) {
  const { t } = useLanguage();
  const [activeSide, setActiveSide] = useState(null);
  const [citizenMethod, setCitizenMethod] = useState('email');
  // Staff gateway state — stays on this page: null shows the Admin /
  // Distributor picker, otherwise the box swaps in-place to that role's form.
  const [staffRole, setStaffRole] = useState(null);
  const [staffMethod, setStaffMethod] = useState('email');

  const activate = (side) => setActiveSide(side);
  const deactivate = () => setActiveSide(null);

  const handleSuccess = (portalKey, user) => {
    if (!onAuthSuccess) return;
    onAuthSuccess(user, portalKey);
  };

  const staffTitle = staffRole === 'admin'
    ? t('auth.loginAsAdmin')
    : staffRole === 'distributor'
      ? t('auth.loginAsDistributor')
      : t('auth.staffLogin');

  return (
    <div className="relative min-h-screen font-sans bg-slate-950 text-white overflow-x-hidden flex flex-col">
      <SkipLink />
      <HoverSplitBackdrop image={heroBackdrop} activeSide={activeSide} />

      <div className="relative z-20 pt-16 pb-6 shrink-0 text-center px-6 pointer-events-none">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
          {t('auth.accessPortal')}
        </h1>
        <p className="text-xl font-medium tracking-normal text-slate-200 mt-2">
          {t('auth.chooseGateway')}
        </p>
      </div>

      <div className="relative z-20 flex justify-center px-6 pb-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <LanguageToggle />
        </div>
        <AccessibilityToolbar />
      </div>

      <div className="relative z-20 flex flex-col md:flex-row items-stretch justify-center flex-1 py-6" role="main" id="main-content" tabIndex={-1}>
        {/* Citizen gateway — unchanged */}
        <section
          onMouseEnter={() => activate('left')}
          onMouseLeave={deactivate}
          onFocus={() => activate('left')}
          onBlur={deactivate}
          className="flex-1 flex items-center justify-center p-5 md:p-10 transition-opacity duration-700"
        >
          <div
            className={`w-full max-w-sm bg-white border rounded-xl p-8 space-y-5 transition-all duration-500 ${
              activeSide === 'left' ? 'border-[#FF9933] -translate-y-1 shadow-xl' : 'border-slate-200 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 flex items-center justify-center border shrink-0 border-[#138808] text-[#138808] bg-green-50">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-xl font-medium tracking-tight text-[#000080]">
                  {t('auth.userLogin')}
                </h2>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                  {t('auth.userLoginSub')}
                </p>
              </div>
            </div>

            <AuthMethodTabs
              value={citizenMethod}
              onChange={setCitizenMethod}
              accent="emerald"
            />

            {citizenMethod === 'email' ? (
              <AuthEmailForm
                role="citizen"
                accent="emerald"
                onSuccess={(user) => handleSuccess('citizen', user)}
                onForgotPassword={() => onNavigate && onNavigate('auth-forgot')}
              />
            ) : (
              <AuthOtpForm
                role="citizen"
                accent="emerald"
                onSuccess={(user) => handleSuccess('citizen', user)}
              />
            )}

            <p className="text-center text-[11px] font-semibold text-slate-500 pt-3">
              {t('auth.newToPortal')}{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('auth-register')}
                className="text-[#138808] hover:text-[#FF9933] font-bold cursor-pointer transition-colors"
              >
                {t('auth.createAccount')}
              </button>
            </p>
          </div>
        </section>

        {/* Staff gateway — picker swaps in-place to the chosen role's form */}
        <section
          onMouseEnter={() => activate('right')}
          onMouseLeave={deactivate}
          onFocus={() => activate('right')}
          onBlur={deactivate}
          className="flex-1 flex items-center justify-center p-5 md:p-10 transition-opacity duration-700"
        >
          <div
            className={`w-full max-w-sm bg-white border rounded-xl p-8 space-y-5 transition-all duration-500 ${
              activeSide === 'right' ? 'border-[#FF9933] -translate-y-1 shadow-xl' : 'border-slate-200 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 flex items-center justify-center border shrink-0 border-[#FF9933] text-[#FF9933] bg-orange-50">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-xl font-medium tracking-tight text-[#000080]">
                  {staffTitle}
                </h2>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                  {t('auth.staffLoginSub')}
                </p>
              </div>
            </div>

            {staffRole === null ? (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-500 leading-snug">
                  {t('auth.chooseStaffRole')}
                </p>
                <button
                  type="button"
                  onClick={() => setStaffRole('admin')}
                  className={`w-full flex items-center gap-3 border border-slate-300 hover:border-[#FF9933] hover:bg-orange-50/50 px-4 py-3.5 text-left transition-colors cursor-pointer ${FOCUS}`}
                >
                  <ShieldCheck size={20} className="text-[#000080] shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{t('auth.adminRole')}</span>
                    <span className="block text-[11px] font-medium text-slate-500">{t('auth.adminRoleSub')}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStaffRole('distributor')}
                  className={`w-full flex items-center gap-3 border border-slate-300 hover:border-[#FF9933] hover:bg-orange-50/50 px-4 py-3.5 text-left transition-colors cursor-pointer ${FOCUS}`}
                >
                  <Building2 size={20} className="text-[#FF9933] shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{t('auth.distributorRole')}</span>
                    <span className="block text-[11px] font-medium text-slate-500">{t('auth.distributorRoleSub')}</span>
                  </span>
                </button>
                <p className="text-center text-[10px] font-medium text-slate-500 tracking-wide pt-3">
                  {t('auth.staffProvisioned')}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setStaffRole(null)}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 hover:text-orange-600 transition-colors cursor-pointer ${FOCUS}`}
                >
                  <ArrowLeft size={13} aria-hidden="true" />
                  {t('auth.backToStaff')}
                </button>

                <AuthMethodTabs
                  value={staffMethod}
                  onChange={setStaffMethod}
                  accent="amber"
                />

                {staffMethod === 'email' ? (
                  <AuthEmailForm
                    key={`staff-email-${staffRole}`}
                    role={staffRole}
                    accent="amber"
                    onSuccess={(user) => handleSuccess(staffRole, user)}
                    onForgotPassword={() => onNavigate && onNavigate('auth-forgot')}
                  />
                ) : (
                  <AuthOtpForm
                    key={`staff-otp-${staffRole}`}
                    role={staffRole}
                    accent="amber"
                    onSuccess={(user) => handleSuccess(staffRole, user)}
                  />
                )}

                <p className="text-center text-[10px] font-medium text-slate-500 tracking-wide pt-3">
                  {t('auth.staffProvisioned')}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
