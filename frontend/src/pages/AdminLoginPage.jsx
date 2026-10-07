import { useState } from 'react';
import { Users, Building2, ShieldCheck, ArrowLeft } from 'lucide-react';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import AuthMethodTabs from '../components/auth/AuthMethodTabs';
import AuthEmailForm from '../components/auth/AuthEmailForm';
import AuthOtpForm from '../components/auth/AuthOtpForm';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';
import SkipLink from '../components/SkipLink';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { useLanguage } from '../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// Fixed viewport page (no body scroll): the two gateway cards share one row
// and scroll internally only if the viewport is too short for their content.
// All three states (User Login, Staff picker, role form) share one card size.
const CARD =
  'w-full bg-white dark:bg-slate-900 border rounded-xl transition-all duration-500 flex flex-col max-h-full overflow-y-auto';
const CARD_COMPACT = 'max-w-sm p-8 space-y-5';

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
  // Keep the split backdrop stable while tabbing between controls inside one
  // gateway: only clear the hover when focus truly leaves the section, so the
  // artwork effect matches a mouse hover exactly.
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) deactivate();
  };

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
    <div className="relative h-screen overflow-hidden font-sans bg-slate-950 text-white flex flex-col">
      <SkipLink />
      <HoverSplitBackdrop image={heroBackdrop} activeSide={activeSide} />

      <div className="relative z-20 pt-8 pb-3 shrink-0 text-center px-6 pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">
          {t('auth.accessPortal')}
        </h1>
        <p className="text-base font-medium tracking-normal text-slate-200 mt-1">
          {t('auth.chooseGateway')}
        </p>
      </div>

      {/* Toolbar row sits above the gateway cards (z-30 vs their z-20): the
          widget's fixed z-2000 is trapped inside this wrapper's stacking
          context, so without the higher layer the staff card (a later z-20
          sibling) paints over the widget and swallows its clicks. The widget
          itself stays edge-docked exactly as on every other page. */}
      <div className="relative z-30 flex justify-center px-6 pb-1 shrink-0">
        <AccessibilityToolbar />
      </div>

      <div className="relative z-20 flex flex-col md:flex-row items-stretch justify-center flex-1 min-h-0 py-4" role="main" id="main-content" tabIndex={-1}>
        {/* Citizen gateway */}
        <section
          onMouseEnter={() => activate('left')}
          onMouseLeave={deactivate}
          onFocus={() => activate('left')}
          onBlur={handleBlur}
          className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-6 transition-opacity duration-700"
        >
          <div
            className={`${CARD} ${CARD_COMPACT} ${
              activeSide === 'left' ? 'border-[#FF9933] -translate-y-1 shadow-xl' : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 flex items-center justify-center border shrink-0 border-[#138808] text-[#138808] dark:text-green-300 bg-green-50 dark:bg-green-950">
                <Users size={22} />
              </div>
              <h2 className="text-xl font-medium tracking-tight text-[#000080] dark:text-[#B9C8FF]">
                {t('auth.userLogin')}
              </h2>
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

            <p className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-3 mt-auto">
              {t('auth.newToPortal')}{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('auth-register')}
                className="text-[#138808] dark:text-green-400 hover:text-[#FF9933] font-bold cursor-pointer transition-colors"
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
          onBlur={handleBlur}
          className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-6 transition-opacity duration-700"
        >
          <div
            className={`${CARD} ${CARD_COMPACT} ${
              activeSide === 'right' ? 'border-[#FF9933] -translate-y-1 shadow-xl' : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 flex items-center justify-center border shrink-0 border-[#FF9933] text-[#FF9933] dark:text-orange-300 bg-orange-50 dark:bg-orange-950">
                <Building2 size={22} />
              </div>
              <h2 className="text-xl font-medium tracking-tight text-[#000080] dark:text-[#B9C8FF]">
                {staffTitle}
              </h2>
            </div>

            {staffRole === null ? (
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                  {t('auth.chooseStaffRole')}
                </p>
                <button
                  type="button"
                  onClick={() => setStaffRole('admin')}
                  className={`w-full flex items-center gap-3 border border-slate-300 dark:border-slate-600 hover:border-[#FF9933] hover:bg-orange-50 dark:hover:bg-slate-800 px-4 py-3.5 text-left transition-colors cursor-pointer group ${FOCUS}`}
                >
                  <ShieldCheck size={20} className="text-slate-400 group-hover:text-[#FF9933] shrink-0 transition-colors" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">{t('auth.adminRole')}</span>
                    <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('auth.adminRoleSub')}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStaffRole('distributor')}
                  className={`w-full flex items-center gap-3 border border-slate-300 dark:border-slate-600 hover:border-[#138808] hover:bg-green-50 dark:hover:bg-slate-800 px-4 py-3.5 text-left transition-colors cursor-pointer group ${FOCUS}`}
                >
                  <Building2 size={20} className="text-slate-400 group-hover:text-[#138808] shrink-0 transition-colors" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">{t('auth.distributorRole')}</span>
                    <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('auth.distributorRoleSub')}</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setStaffRole(null)}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors cursor-pointer ${FOCUS}`}
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
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
