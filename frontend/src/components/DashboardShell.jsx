import { ChevronDown } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import terminalHubIcon from '../images/nav/terminal-hub.png';
import familyProfileIcon from '../images/nav/family-profile.png';
import rationBookingsIcon from '../images/nav/ration-bookings.png';
import aiHelpDeskIcon from '../images/nav/ai-help-desk.png';
import logoutIcon from '../images/nav/logout.png';
import { useAccount } from '../context/AccountContext';
import { Avatar } from './ui/avatar';
import { swiss, TricolorStrip } from './ui/swiss';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

export default function DashboardShell({ children, currentSubPage, onSubPageChange, onLogout }) {
  const { account } = useAccount();
  const navItems = [
    { id: 'home', label: 'Terminal hub', icon: terminalHubIcon },
    { id: 'profile', label: 'Family profile', icon: familyProfileIcon },
    { id: 'booking', label: 'Ration bookings', icon: rationBookingsIcon },
    { id: 'ai-support', label: 'AI help desk', icon: aiHelpDeskIcon },
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${swiss.page}`}>
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-5 border-r border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-1 mb-4">
            <img src={logoAsset} alt="E-Ration" className="w-11 h-11 object-contain bg-slate-800 p-1 rounded-2xl" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">E-ration portal</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Citizen workspace</p>
            </div>
          </div>

          <TricolorStrip className="h-[3px] mb-5" />

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSubPageChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${FOCUS} ${
                    active
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-1 ${active ? 'bg-orange-500' : 'bg-transparent'}`}
                  />
                  <img src={item.icon} alt="" className="w-7 h-7 object-contain shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white py-3 text-sm font-semibold transition-colors cursor-pointer ${FOCUS}`}
        >
          <img src={logoutIcon} alt="" className="w-5 h-5 object-contain" />
          <span>Log out</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {account?.rationCardNumber && (
          <div className="flex items-center justify-between px-8 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Public Distribution System
            </p>
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5">
              <Avatar src={account.avatar} name={account.name} size={32} />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{account.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Ration card: {account.rationCardNumber}
                </p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        )}
        <div className="p-8 pt-4">{children}</div>
      </main>
    </div>
  );
}
