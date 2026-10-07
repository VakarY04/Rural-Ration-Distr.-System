import { ArrowLeft } from 'lucide-react';
import { swiss } from '../../components/ui/swiss';
import SiteFooter from '../../components/SiteFooter';
import AccessibilityToolbar from '../../components/AccessibilityToolbar';
import { useLanguage } from '../../i18n/LanguageContext';

// Narrow centred layout shared by every public info page (Help, Feedback,
// Sitemap, Policies). Rendered as a top-level `info` route so it works with
// or without a login. Back returns through real history (deep-link safe).
export default function InfoShell({ eyebrow, title, intro, onNavigate, children }) {
  const { t } = useLanguage();
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else if (onNavigate) onNavigate('landing');
  };

  return (
    <div className="min-h-screen font-sans bg-[#F4F6F9] text-[#000080] flex flex-col">
      <AccessibilityToolbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10" id="main-content" tabIndex={-1}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {t('common.back')}
          </button>
        </div>
        <p className={swiss.micro}>{eyebrow}</p>
        <h1 className={`${swiss.headline} mt-1`}>{title}</h1>
        {intro && <p className="text-sm text-slate-500 mt-2 leading-relaxed">{intro}</p>}
        <div className="mt-6 space-y-6">{children}</div>
      </main>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
