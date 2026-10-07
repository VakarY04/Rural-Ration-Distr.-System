import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.webp';
import {
  TerminalHubIcon,
  FamilyProfileIcon,
  RationBookingsIcon,
  AiHelpDeskIcon,
  GovLogoutIcon,
} from './GovNavIcons';
import { useAccount } from '../context/AccountContext';
import { Avatar } from './ui/avatar';
import { swissUser as swiss, TricolorStrip } from './ui/swiss';
import SkipLink from './SkipLink';
import AccessibilityToolbar from './AccessibilityToolbar';
import SiteFooter from './SiteFooter';
import { useLanguage } from '../i18n/LanguageContext';

const FOCUS = 'gov-nav-focus';

export default function DashboardShell({ children, currentSubPage, onSubPageChange, onNavigate, onLogout }) {
  const { account } = useAccount();
  const { t } = useLanguage();
  // Collapsible navigation — persisted so the choice survives reloads. Gives
  // zoomed/low-width viewports room by collapsing to icon-only rails.
  const [navCollapsed, setNavCollapsed] = useState(
    () => localStorage.getItem('dashboard_nav_collapsed') === '1'
  );
  const toggleNav = () => {
    setNavCollapsed((v) => {
      try {
        localStorage.setItem('dashboard_nav_collapsed', v ? '0' : '1');
      } catch {
        // Private mode etc. — collapse simply doesn't persist.
      }
      return !v;
    });
  };
  const navItems = [
    { id: 'home', label: t('nav.terminalHub'), Icon: TerminalHubIcon },
    { id: 'profile', label: t('nav.familyProfile'), Icon: FamilyProfileIcon },
    { id: 'booking', label: t('nav.rationBookings'), Icon: RationBookingsIcon },
    { id: 'ai-support', label: t('nav.aiHelpDesk'), Icon: AiHelpDeskIcon },
  ];

  // Govt palette for the citizen nav: clean white base (black idle text
  // ≈21:1), hover = India Green #138808 (white text ≈4.5:1), selected = Navy
  // #000080 (white text ≈15:1). State is never colour-alone: aria-current +
  // left bar + text label accompany every colour cue (GIGW A12).
  const NAV_IDLE = 'text-black hover:bg-[#138808] hover:text-white';
  const NAV_ACTIVE = 'bg-[#000080] text-white';
  const NAV_MICRO = 'text-black/70';

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${swiss.page}`}>
      <SkipLink />
      <aside className={`${navCollapsed ? 'w-20 px-3' : 'w-64 px-5'} pt-5 pb-3 bg-white text-black flex flex-col justify-between border-r border-slate-200 shrink-0 transition-all duration-200`}>
        <div>
          <div className={`flex items-center gap-3 px-1 mb-4 ${navCollapsed ? 'justify-center px-0' : ''}`}>
            <img src={logoAsset} alt="E-Ration" width={55} height={55} decoding="async" className="w-[55px] h-[55px] object-contain shrink-0" />
            {!navCollapsed && (
              <div>
                <h1 className="text-sm font-bold tracking-tight text-black leading-tight">{t('nav.portalName')}</h1>
                <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${NAV_MICRO}`}>{t('nav.citizenWorkspace')}</p>
              </div>
            )}
          </div>

          <div className="border border-slate-200 mb-5">
            <TricolorStrip className="h-[3px]" />
          </div>

          <nav className="space-y-1" aria-label={t('nav.workspaceLabel')}>
            {navItems.map((item) => {
              const active = currentSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSubPageChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                  title={navCollapsed ? item.label : undefined}
                  aria-label={navCollapsed ? item.label : undefined}
                  className={`relative w-full flex items-center gap-3 py-3 text-sm font-semibold transition-colors cursor-pointer ${FOCUS} ${navCollapsed ? 'justify-center px-2' : 'px-4'} ${
                    active
                      ? NAV_ACTIVE
                      : NAV_IDLE
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-1 ${active ? 'bg-white' : 'bg-transparent'}`}
                  />
                  <item.Icon size={26} />
                  {!navCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onSubPageChange('profile')}
            aria-current={currentSubPage === 'profile' ? 'page' : undefined}
            title={t('nav.familyProfile')}
            className={`relative w-full flex items-center gap-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${FOCUS} ${navCollapsed ? 'justify-center px-2' : 'px-3'} ${
              currentSubPage === 'profile'
                ? NAV_ACTIVE
                : NAV_IDLE
            }`}
          >
            <Avatar src={account?.avatar} name={account?.name || t('nav.citizen')} size={32} />
            {!navCollapsed && (
              <div className="text-left min-w-0">
                <p className="text-sm font-bold leading-tight truncate">{account?.name || t('nav.citizen')}</p>
                <p className={`text-[10px] font-bold uppercase tracking-[0.14em] truncate ${currentSubPage === 'profile' ? 'text-white/80' : NAV_MICRO}`}>
                  {account?.rationCardNumber ? t('nav.rationCard', { id: account.rationCardNumber }) : t('nav.citizenWorkspace')}
                </p>
              </div>
            )}
          </button>

          <button
            onClick={onLogout}
            title={navCollapsed ? t('nav.logout') : undefined}
            className={`w-full flex items-center justify-center gap-2 border border-black/50 bg-white/20 text-black hover:bg-[#138808] hover:border-[#138808] hover:text-white py-3 text-sm font-semibold transition-colors cursor-pointer ${FOCUS}`}
          >
            <GovLogoutIcon size={20} aria-hidden="true" />
            {!navCollapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-clip overscroll-y-contain min-w-0 bg-[#F4F6F9]" id="main-content" tabIndex={-1}>
        <div className="flex items-center justify-between flex-wrap gap-3 px-8 pt-4">
          <button
            type="button"
            onClick={toggleNav}
            aria-expanded={!navCollapsed}
            aria-label={navCollapsed ? t('nav.expandNav') : t('nav.collapseNav')}
            title={navCollapsed ? t('nav.expandNav') : t('nav.collapseNav')}
            className={`inline-flex items-center gap-2 border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-600 px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer bg-white ${FOCUS}`}
          >
            {navCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            <span>{navCollapsed ? t('nav.expand') : t('nav.collapse')}</span>
          </button>
          <AccessibilityToolbar />
        </div>
        {account?.rationCardNumber && (
          <div className="flex items-center justify-between flex-wrap gap-3 px-8 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {t('nav.pds')}
            </p>
          </div>
        )}
        <div className="px-8 pt-4 pb-0 flex-1">{children}</div>
        <SiteFooter onNavigate={onNavigate} />
      </main>
    </div>
  );
}
