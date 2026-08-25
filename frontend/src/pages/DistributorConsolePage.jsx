import { Calendar, ClipboardList, MapPin, LogOut, MessageSquare, Wheat, BadgeCheck } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';

// Modules planned for the distributor console (built in upcoming phases).
const UPCOMING_MODULES = [
  { icon: Calendar, title: 'Slot Oversight', description: 'Review and manage citizen collection appointments across every time window.' },
  { icon: Wheat, title: 'Stock Ledger', description: 'Track depot inventory of rice, wheat and coarse grains in real time.' },
  { icon: ClipboardList, title: 'Pre-Packing Manifest', description: 'Daily supply checklists aggregated from confirmed booking queues.' },
  { icon: MapPin, title: 'Route Management', description: 'Configure warehouse-to-shop delivery routes shown on citizen maps.' },
  { icon: MessageSquare, title: 'Grievance Review', description: 'Triage AI-routed citizen complaints and mark resolution status.' },
];

// Landing console shown right after a distributor/admin signs in.
// Placeholder for the admin modules arriving next; proves the full
// role-aware login loop end to end.
export default function DistributorConsolePage({ onLogout }) {
  const name = localStorage.getItem('ration_user_name') || 'Distributor';

  return (
    <div className="relative min-h-screen font-sans bg-slate-950 text-white overflow-hidden">
      <img
        src={heroBackdrop}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logoAsset} alt="E-Ration" className="w-10 h-10 object-contain rounded-xl bg-slate-900/60 p-1" />
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Distributor Console</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-Ration Staff Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/30 text-amber-300 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <BadgeCheck size={13} />
            Authorized Staff
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900/80 hover:bg-red-600/80 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-lg transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Welcome strip */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Welcome back, {name}</h1>
        <p className="text-xs md:text-sm text-slate-300 font-medium mt-2 max-w-2xl leading-relaxed">
          You are signed in through the staff portal. Operational modules are being rolled out in phases —
          here is what is scheduled for this workspace.
        </p>
      </section>

      {/* Upcoming module grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UPCOMING_MODULES.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-white/25 rounded-3xl p-6 space-y-3 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/25 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{description}</p>
            <span className="inline-block bg-white/5 border border-white/15 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-300">
              Coming Next Phase
            </span>
          </article>
        ))}
      </section>

      <footer className="relative z-10 text-center pb-8 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        E-Ration Portal · Distributor Console v0.1
      </footer>
    </div>
  );
}
