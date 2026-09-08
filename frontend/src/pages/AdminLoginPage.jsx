import { useState } from 'react';
import { Users, Building2 } from 'lucide-react';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import AuthMethodTabs from '../components/auth/AuthMethodTabs';
import AuthEmailForm from '../components/auth/AuthEmailForm';
import AuthOtpForm from '../components/auth/AuthOtpForm';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';

const PORTALS = [
  {
    key: 'citizen',
    side: 'left',
    title: 'User Login',
    subtitle: 'Ration card holders — manage your household entitlements',
    icon: Users,
    accent: 'emerald',
    iconBox: 'border-[#138808] text-[#138808] bg-green-50',
    methodHint: 'Sign in with email or a mobile OTP',
  },
  {
    key: 'distributor',
    side: 'right',
    title: 'Distributor Login',
    subtitle: 'Fair Price Shop staff & department administrators',
    icon: Building2,
    accent: 'amber',
    iconBox: 'border-[#FF9933] text-[#FF9933] bg-orange-50',
    methodHint: 'Staff accounts work with both sign-in methods',
  },
];

export default function AdminLoginPage({ onNavigate, onAuthSuccess }) {
  const [activeSide, setActiveSide] = useState(null);
  const [method, setMethod] = useState({ citizen: 'email', distributor: 'email' });

  const activate = (side) => setActiveSide(side);
  const deactivate = () => setActiveSide(null);

  const handleSuccess = (portalKey, user) => {
    if (!onAuthSuccess) return;
    onAuthSuccess(user, portalKey);
  };

  return (
    <div className="relative h-screen font-sans bg-slate-950 text-white overflow-hidden flex flex-col">
      <HoverSplitBackdrop image={heroBackdrop} activeSide={activeSide} />

      <div className="relative z-20 pt-16 pb-6 shrink-0 text-center px-6 pointer-events-none">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
          E-Ration Access Portal
        </h1>
        <p className="text-xl font-medium tracking-normal text-slate-200 mt-2">
          Choose your gateway
        </p>
      </div>

      <div className="relative z-20 flex flex-col md:flex-row items-stretch justify-center flex-1 min-h-0 -translate-y-7">
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
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
                  className={`w-full max-w-sm bg-white border rounded-3xl p-8 space-y-5 transition-all duration-500 ${
                    isActive ? 'border-[#FF9933] -translate-y-1 shadow-xl' : 'border-slate-200 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 flex items-center justify-center border shrink-0 ${portal.iconBox}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-[#000080]">
                      {portal.title}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-snug">
                      {portal.subtitle}
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
                    New to the portal?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('auth-register')}
                      className="text-[#138808] hover:text-[#FF9933] font-bold cursor-pointer transition-colors"
                    >
                      Create a citizen account
                    </button>
                  </p>
                ) : (
                  <p className="text-center text-[10px] font-medium text-slate-400 tracking-wide pt-3">
                    Staff accounts are provisioned by the Food & Civil Supplies department
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
