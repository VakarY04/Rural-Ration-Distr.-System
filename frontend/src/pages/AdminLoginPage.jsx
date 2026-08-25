import { useState } from 'react';
import { ArrowLeft, Users, Building2 } from 'lucide-react';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import AuthMethodTabs from '../components/auth/AuthMethodTabs';
import AuthEmailForm from '../components/auth/AuthEmailForm';
import AuthOtpForm from '../components/auth/AuthOtpForm';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';

// Portal panel definitions — each side of the split screen.
const PORTALS = [
  {
    key: 'citizen',
    side: 'left',
    title: 'User Login',
    subtitle: 'Ration card holders — manage your household entitlements',
    icon: Users,
    accent: 'emerald',
    methodHint: 'Sign in with email or a mobile OTP',
  },
  {
    key: 'distributor',
    side: 'right',
    title: 'Distributor Login',
    subtitle: 'Fair Price Shop staff & department administrators',
    icon: Building2,
    accent: 'amber',
    methodHint: 'Staff accounts work with both sign-in methods',
  },
];

// Unified split-screen login: citizen portal on one half, distributor
// portal on the other. Hovering (or focusing) a panel reveals its half of
// the backdrop in full clarity while the opposite half stays translucent.
export default function AdminLoginPage({ onNavigate, onAuthSuccess }) {
  const [activeSide, setActiveSide] = useState(null);
  const [method, setMethod] = useState({ citizen: 'email', distributor: 'email' });

  const activate = (side) => setActiveSide(side);
  const deactivate = () => setActiveSide(null);

  const handleSuccess = (portalKey, user) => {
    if (!onAuthSuccess) return;
    // Citizens land on the household dashboard; staff enter their console.
    onAuthSuccess(user, portalKey);
  };

  return (
    <div className="relative h-screen font-sans bg-slate-950 text-white overflow-hidden flex flex-col">
      <HoverSplitBackdrop image={heroBackdrop} activeSide={activeSide} />

      {/* Top-left back navigation */}
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('landing')}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-xs font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-105"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      {/* Centered page heading */}
      <div className="relative z-20 pt-20 pb-4 shrink-0 text-center px-6 pointer-events-none">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight drop-shadow-lg">
          E-Ration Access Portal
        </h1>
        <p className="text-[11px] md:text-xs text-slate-300 font-semibold mt-1.5">
          Choose your gateway — hover a panel to bring its world into focus
        </p>
      </div>

      {/* The two portal halves */}
      <div className="relative z-20 flex flex-col md:flex-row items-stretch justify-center flex-1 min-h-0">
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
                className={`w-full max-w-sm bg-slate-900/60 backdrop-blur-md border p-8 rounded-3xl shadow-2xl space-y-5 transition-all duration-500 ${
                  isActive ? 'border-white/40 -translate-y-1' : 'border-white/15'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                      portal.accent === 'amber'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-400/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight">{portal.title}</h2>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5 leading-snug">
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
                  <p className="text-center text-[11px] font-semibold text-slate-300 border-t border-white/10 pt-4">
                    New to the portal?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('auth-register')}
                      className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer transition-colors"
                    >
                      Create a citizen account
                    </button>
                  </p>
                ) : (
                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-white/10 pt-4">
                    Staff accounts are provisioned by the Food &amp; Civil Supplies department
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
