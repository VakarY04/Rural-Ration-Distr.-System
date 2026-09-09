import { siteMeta } from '../config/siteMeta';
import { swiss, TricolorStrip } from './ui/swiss';
import { useLanguage } from '../i18n/LanguageContext';

// Shared footer for every page (citizen shells, console, landing, info pages).
// One component → identical Help / Feedback / Sitemap / policy links in the
// same place everywhere (GIGW Q-minimum-content + Q14 Help). Ownership comes
// from config/siteMeta.js so a handover edits one file, not every page.
export default function SiteFooter({ onNavigate }) {
  const { t } = useLanguage();
  const go = (view) => () => onNavigate && onNavigate('info', { subPage: view });

  const linkCls =
    'hover:text-slate-900 hover:underline underline-offset-2 transition-colors cursor-pointer';

  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <TricolorStrip className="h-[3px]" />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {siteMeta.projectName} · {siteMeta.tagline}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {siteMeta.ownershipNote} · Maintained by {siteMeta.ownerName} · {siteMeta.ownerEmail}
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500">
            <button type="button" onClick={go('help')} className={linkCls}>{t('footer.help')}</button>
            <button type="button" onClick={go('feedback')} className={linkCls}>{t('footer.feedback')}</button>
            <button type="button" onClick={go('sitemap')} className={linkCls}>{t('footer.sitemap')}</button>
            <button type="button" onClick={go('policy-terms')} className={linkCls}>{t('footer.terms')}</button>
            <button type="button" onClick={go('policy-privacy')} className={linkCls}>{t('footer.privacy')}</button>
            <button type="button" onClick={go('policy-accessibility')} className={linkCls}>{t('footer.accessibility')}</button>
            <button type="button" onClick={go('policy-copyright')} className={linkCls}>{t('footer.copyright')}</button>
          </nav>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <p className={swiss.micro}>© {new Date().getFullYear()} {siteMeta.projectName} · {siteMeta.ownerName}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
            <span className="uppercase tracking-[0.14em]">{t('footer.govLinks')}</span>
            {siteMeta.govLinks.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkCls}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
