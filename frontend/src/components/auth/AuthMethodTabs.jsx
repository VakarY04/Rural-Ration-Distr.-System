import { Mail, Smartphone } from 'lucide-react';

const TABS = [
  { key: 'email', label: 'Email & Password', icon: Mail },
  { key: 'otp', label: 'Phone OTP', icon: Smartphone },
];

const ACTIVE_TAB = {
  emerald: 'bg-green-700 text-white',
  amber: 'bg-orange-600 text-white',
};

export default function AuthMethodTabs({ value, onChange, accent = 'emerald' }) {
  const activeTab = ACTIVE_TAB[accent] || ACTIVE_TAB.emerald;

  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 border border-slate-200">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
            value === key ? activeTab : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
