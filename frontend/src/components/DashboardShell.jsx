import React from 'react';
import { LayoutDashboard, Users, Calendar, Bot, LogOut, ShieldCheck } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function DashboardShell({ children, currentSubPage, onSubPageChange, onLogout }) {
  const navItems = [
    { id: 'home', label: 'Terminal Hub', icon: LayoutDashboard },
    { id: 'profile', label: 'Family Profiles', icon: Users },
    { id: 'booking', label: 'Ration Bookings', icon: Calendar },
    { id: 'ai-support', label: 'Gemini AI Help', icon: Bot },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-5 border-r border-slate-800 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <img src={logoAsset} alt="E-Ration" className="w-10 h-10 object-contain rounded-xl bg-slate-800 p-1" />
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">E-Distribution</h1>
              <p className="text-[10px] text-slate-400 font-medium">Citizen Workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSubPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Terminate Session</span>
        </button>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}