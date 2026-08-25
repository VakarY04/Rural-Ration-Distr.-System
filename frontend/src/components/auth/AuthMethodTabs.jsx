import { Mail, Smartphone } from 'lucide-react';

// Segmented Email | Phone-OTP switcher shared by both portal panels.
const TABS = [
  { key: 'email', label: 'Email & Password', icon: Mail },
  { key: 'otp', label: 'Phone OTP', icon: Smartphone },
];

export default function AuthMethodTabs({ value, onChange, accent = 'emerald' }) {
  const activeTab =
    accent === 'amber'
      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
      : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25';

  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            value === key ? activeTab : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
