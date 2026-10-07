import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

// Header theme switch: moon in light mode, sun in dark mode. Ghost styling
// reads on both the landing hero image and light app surfaces; the parent
// page may add dark: tweaks via className.
export default function DarkModeToggle({ className = '' }) {
  const { dark, toggle } = useTheme();
  const { t } = useLanguage();
  const label = dark ? t('theme.switchLight') : t('theme.switchDark');

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={dark}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9933] ${className}`}
    >
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
