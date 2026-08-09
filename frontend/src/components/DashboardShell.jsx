import React from 'react';
import logoAsset from '../images/E-RATION Logo.png';
import terminalHubIcon from '../images/nav/terminal-hub.png';
import familyProfileIcon from '../images/nav/family-profile.png';
import rationBookingsIcon from '../images/nav/ration-bookings.png';
import aiHelpDeskIcon from '../images/nav/ai-help-desk.png';
import logoutIcon from '../images/nav/logout.png';

export default function DashboardShell({ children, currentSubPage, onSubPageChange, onLogout }) {
  const navItems = [
    { id: 'home', label: 'Terminal hub', icon: terminalHubIcon },
    { id: 'profile', label: 'Family profile', icon: familyProfileIcon },
    { id: 'booking', label: 'Ration bookings', icon: rationBookingsIcon },
    { id: 'ai-support', label: 'AI help desk', icon: aiHelpDeskIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-5 border-r border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-1 mb-4">
            <img src={logoAsset} alt="E-Ration" className="w-11 h-11 object-contain rounded-xl bg-slate-800 p-1" />
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">E-ration portal</h1>
              <p className="text-[11px] text-slate-400 font-medium">Citizen workspace</p>
            </div>
          </div>

          <div
            className="h-[3px] w-full rounded-full mb-5"
            style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #E2E8F0 50%, #10B981 100%)' }}
          />

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSubPageChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                    active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <img src={item.icon} alt="" className="w-5 h-5 object-contain shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <img src={logoutIcon} alt="" className="w-4 h-4 object-contain" />
          <span>Log out</span>
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}