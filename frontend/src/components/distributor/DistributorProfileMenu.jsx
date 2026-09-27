import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Avatar } from '../ui/avatar';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// Distributor profile access card — mirrors the User-side avatar/name chip
// used in the citizen DashboardShell, but adds a dropdown with "Go to
// Profile" and "Logout".
export default function DistributorProfileMenu({ name, role, avatar, onNavigate, onLogout }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close the dropdown when clicking anywhere outside the card.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goToProfile = () => {
    setOpen(false);
    onNavigate('distributor-console', { subPage: 'profile' });
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-3 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2.5 transition-colors cursor-pointer ${FOCUS}`}
      >
        <Avatar src={avatar} name={name || t('staffMenu.fallback')} size={32} />
        <div className="text-left min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">{name || t('staffMenu.fallback')}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 break-words">
            {role || t('staffMenu.fallback')}
          </p>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 overflow-hidden z-50"
        >
          <button
            type="button"
            role="menuitem"
            onClick={goToProfile}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 break-words"
          >
            {t('staffMenu.profile')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer break-words"
          >
            {t('staffMenu.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
