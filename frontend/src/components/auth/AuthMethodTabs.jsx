import { Mail, Smartphone } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getActiveTabClass } from '../ui/authStyles';

export default function AuthMethodTabs({ value, onChange, accent = 'emerald' }) {
  const { t } = useLanguage();
  const TABS = [
    { key: 'email', label: t('auth.tab.email'), icon: Mail },
    { key: 'otp', label: t('auth.tab.otp'), icon: Smartphone },
  ];
  const activeTab = getActiveTabClass(accent);

  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
            value === key ? activeTab : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
