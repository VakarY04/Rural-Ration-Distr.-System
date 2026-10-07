import { useState } from 'react';
import { Search, ArrowRight, Lock } from 'lucide-react';
import { swiss } from '../../components/ui/swiss';
import { useLanguage } from '../../i18n/LanguageContext';
import InfoShell from './InfoShell';

// Combined Search + Sitemap: one filter box over the full route index, so
// citizens can find any page by typing. Citizen routes need a login; public
// routes work for everyone — each row says which.

export default function SitemapPage({ onNavigate }) {
  const { t } = useLanguage();
  const INDEX = [
    { label: t('sitemap.page1'), route: 'landing', access: t('sitemap.public'), hint: t('sitemap.hint1') },
    { label: t('sitemap.page2'), route: 'admin-login', access: t('sitemap.public'), hint: t('sitemap.hint2') },
    { label: t('sitemap.page3'), route: 'dashboard:home', access: t('sitemap.login'), hint: t('sitemap.hint3') },
    { label: t('sitemap.page4'), route: 'dashboard:profile', access: t('sitemap.login'), hint: t('sitemap.hint4') },
    { label: t('sitemap.page5'), route: 'dashboard:booking', access: t('sitemap.login'), hint: t('sitemap.hint5') },
    { label: t('sitemap.page6'), route: 'dashboard:ai-support', access: t('sitemap.login'), hint: t('sitemap.hint6') },
    { label: t('sitemap.page7'), route: 'distributor-console', access: t('sitemap.staff'), hint: t('sitemap.hint7') },
    { label: t('sitemap.page8'), route: 'info:help', access: t('sitemap.public'), hint: t('sitemap.hint8') },
    { label: t('sitemap.page9'), route: 'info:feedback', access: t('sitemap.public'), hint: t('sitemap.hint9') },
    { label: t('sitemap.page10'), route: 'info:policy-terms', access: t('sitemap.public'), hint: t('sitemap.hint10') },
  ];
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = INDEX.filter(
    (r) => !q || r.label.toLowerCase().includes(q) || r.hint.toLowerCase().includes(q)
  );
  // Staff-only rows stay visible (a sitemap must list everything) but citizens
  // get no Open button — the real gate is the backend's staff check, this just
  // avoids sending citizens into a dead-end error page.
  const role = localStorage.getItem('ration_user_role');
  const isStaff = role === 'distributor' || role === 'admin';

  const open = (route) => () => {
    if (!onNavigate) return;
    if (route.startsWith('dashboard:')) onNavigate('dashboard', { subPage: route.split(':')[1] });
    else if (route.startsWith('info:')) onNavigate('info', { subPage: route.split(':')[1] });
    else onNavigate(route);
  };

  return (
    <InfoShell
      eyebrow={t('sitemap.eyebrow')}
      title={t('sitemap.title')}
      intro={t('sitemap.intro')}
      onNavigate={onNavigate}
    >
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <label htmlFor="sitemap-search" className="sr-only">{t('sitemap.searchLabel')}</label>
        <input
          id="sitemap-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('sitemap.searchPh')}
          className={`${swiss.input} pl-11 py-3`}
        />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 break-words">{t('sitemap.noMatch', { query })}</p>
      ) : (
        <ol className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-700" aria-label={t('sitemap.listLabel')}>
          {rows.map((r) => (
            <li key={r.route} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words min-w-0">{r.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 break-words min-w-0">{r.hint} · {r.access}</p>
              </div>
              {r.route === 'distributor-console' && !isStaff ? (
                <span
                  title={t('sitemap.staffOnlyTitle')}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400 break-words"
                >
                  <Lock size={12} aria-hidden="true" />
                  {t('sitemap.staffOnly')}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={open(r.route)}
                  title={t('sitemap.openTitle', { label: r.label })}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  {t('sitemap.open')} <ArrowRight size={13} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </InfoShell>
  );
}
