// Phase 3.2 — EN / हिंदी toggle. Segmented control; persists via
// LanguageContext (localStorage `eration_lang`) and flips `<html lang>`.
// Compact by default so it fits beside the accessibility toolbar in headers.
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useLanguage();
  const isHi = lang === 'hi';
  const base =
    'px-2.5 py-1.5 text-[11px] font-bold leading-none transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500';

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      title={t('lang.label')}
      className={`inline-flex items-center rounded-full border border-slate-300 bg-white p-0.5 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={!isHi}
        title={t('lang.english')}
        className={`${base} rounded-full ${!isHi ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('hi')}
        aria-pressed={isHi}
        title={t('lang.hindi')}
        lang="hi"
        className={`${base} rounded-full ${isHi ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
      >
        हिंदी
      </button>
    </div>
  );
}
