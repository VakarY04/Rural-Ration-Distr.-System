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
    'hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-2 transition-colors cursor-pointer';

  const govLinkLabel = (id) =>
    id === 'myScheme' ? 'myScheme' : t(`footer.govLink${id}`);

  return (
    <footer className="mt-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <TricolorStrip className="h-[3px]" />
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {siteMeta.projectName} · {t('footer.tagline')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('footer.ownershipNote')} · {t('footer.maintainedBy', { owner: siteMeta.ownerName, email: siteMeta.ownerEmail })}
            </p>
          </div>
          <nav aria-label={t('footer.navLabel')} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <button type="button" onClick={go('help')} className={linkCls}>{t('footer.help')}</button>
            <button type="button" onClick={go('feedback')} className={linkCls}>{t('footer.feedback')}</button>
            <button type="button" onClick={go('sitemap')} className={linkCls}>{t('footer.sitemap')}</button>
            <button type="button" onClick={go('policy-terms')} className={linkCls}>{t('footer.terms')}</button>
            <button type="button" onClick={go('policy-privacy')} className={linkCls}>{t('footer.privacy')}</button>
            <button type="button" onClick={go('policy-accessibility')} className={linkCls}>{t('footer.accessibility')}</button>
            <button type="button" onClick={go('policy-copyright')} className={linkCls}>{t('footer.copyright')}</button>
          </nav>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className={swiss.micro}>© {new Date().getFullYear()} {siteMeta.projectName} · {siteMeta.ownerName}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-[0.14em]">{t('footer.govLinks')}</span>
            {siteMeta.govLinks.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkCls}>
                {govLinkLabel(l.id)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
