import { useState } from 'react';
import { Users, Building2 } from 'lucide-react';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import AuthMethodTabs from '../components/auth/AuthMethodTabs';
import AuthEmailForm from '../components/auth/AuthEmailForm';
import AuthOtpForm from '../components/auth/AuthOtpForm';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';
import SkipLink from '../components/SkipLink';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

const PORTALS = [
  {
    key: 'citizen',
    side: 'left',
    icon: Users,
    accent: 'emerald',
    iconBox: 'border-[#138808] text-[#138808] bg-green-50',
  },
  {
    key: 'distributor',
    side: 'right',
    icon: Building2,
    accent: 'amber',
    iconBox: 'border-[#FF9933] text-[#FF9933] bg-orange-50',
  },
];

export default function AdminLoginPage({ onNavigate, onAuthSuccess }) {
  const { t } = useLanguage();
  const portalText = {
    citizen: {
      title: t('auth.userLogin'),
      subtitle: t('auth.userLoginSub'),
      methodHint: t('auth.methodHintCitizen'),
    },
    distributor: {
      title: t('auth.distributorLogin'),
      subtitle: t('auth.distributorLoginSub'),
      methodHint: t('auth.methodHintStaff'),
    },
  };
  const [activeSide, setActiveSide] = useState(null);
  const [method, setMethod] = useState({ citizen: 'email', distributor: 'email' });

  const activate = (side) => setActiveSide(side);
  const deactivate = () => setActiveSide(null);

  const handleSuccess = (portalKey, user) => {
    if (!onAuthSuccess) return;
    onAuthSuccess(user, portalKey);
  };

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
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          const txt = portalText[portal.key];
          const isActive = activeSide === portal.side;
          return (
            <section
              key={portal.key}
              onMouseEnter={() => activate(portal.side)}
              onMouseLeave={deactivate}
              onFocus={() => activate(portal.side)}
              onBlur={deactivate}
              className="flex-1 flex items-center justify-center p-5 md:p-10 transition-opacity duration-700"
            >
                <div
                  className={`w-full max-w-sm bg-white border rounded-xl p-8 space-y-5 transition-all duration-500 ${
                    isActive ? 'border-[#FF9933] -translate-y-1 shadow-xl' : 'border-slate-200 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 flex items-center justify-center border shrink-0 ${portal.iconBox}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-[#000080]">
                      {txt.title}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                      {txt.subtitle}
                    </p>
                  </div>
                </div>

                <AuthMethodTabs
                  value={method[portal.key]}
                  onChange={(next) => setMethod((prev) => ({ ...prev, [portal.key]: next }))}
                  accent={portal.accent}
                />

                {method[portal.key] === 'email' ? (
                  <AuthEmailForm
                    role={portal.key}
                    accent={portal.accent}
                    onSuccess={(user) => handleSuccess(portal.key, user)}
                    onForgotPassword={() => onNavigate && onNavigate('auth-forgot')}
                  />
                ) : (
                  <AuthOtpForm
                    role={portal.key}
                    accent={portal.accent}
                    onSuccess={(user) => handleSuccess(portal.key, user)}
                  />
                )}

                {portal.key === 'citizen' ? (
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
                ) : (
                  <p className="text-center text-[10px] font-medium text-slate-500 tracking-wide pt-3">
                    {t('auth.staffProvisioned')}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
