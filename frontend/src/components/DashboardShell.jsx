import React from 'react';
import { LayoutDashboard, UserSquare, CalendarDays, LogOut } from 'lucide-react';
import { authService } from '../api';

export default function DashboardShell({ currentSubPage, onSubPageChange, onLogout, children }) {
  const menuItems = [
    { id: 'home', label: 'Terminal Hub', icon: <LayoutDashboard size={16} /> },
    { id: 'profile', label: 'Family Profiles', icon: <UserSquare size={16} /> },
    { id: 'booking', label: 'Ration Bookings', icon: <CalendarDays size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row font-sans">
      {/* Structural Workspace Sidebar */}
      <aside className="w-full md:w-64 bg-[#1A365D] text-white flex flex-col justify-between p-4 shrink-0 shadow-xl">
        <div className="space-y-6">
          <div className="border-b border-blue-900 pb-4 text-center md:text-left">
            <h2 className="font-black text-sm tracking-wide uppercase">E-Distribution</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Citizen Workspace</p>
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id} onClick={() => onSubPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition ${currentSubPage === item.id ? 'bg-blue-800 text-white shadow-inner' : 'text-slate-300 hover:bg-blue-900/60'}`}
              >
                {item.icon} <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button onClick={() => { authService.logout(); onLogout(); }} className="w-full mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-xs font-bold py-2.5 rounded-xl transition shadow">
          <LogOut size={14} /> <span>Terminate Session</span>
        </button>
      </aside>

      {/* Primary Display Framework View */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl">
        {children}
      </main>
    </div>
  );
}