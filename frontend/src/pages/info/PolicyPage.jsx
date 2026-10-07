import { swiss } from '../../components/ui/swiss';
import InfoShell from './InfoShell';
import { POLICIES, POLICY_KEYS } from './policies';
import { useLanguage } from '../../i18n/LanguageContext';
import { siteMeta } from '../../config/siteMeta';

// Renders one policy document by key, with a switcher for the rest.
// Document text lives in policies.js — this file is only presentation.
// Localization happens at render via t(`policy.${doc}.*`) with siteMeta vars;
// POLICIES is the fallback so a missing key never renders blank.
export default function PolicyPage({ doc = 'terms', onNavigate }) {
  const { t } = useLanguage();
  const activeKey = POLICIES[doc] ? doc : 'terms';
  const vars = {
    project: siteMeta.projectName,
    owner: siteMeta.ownerName,
    email: siteMeta.ownerEmail,
    year: new Date().getFullYear(),
  };
  const pick = (key, fallback, v) => {
    const val = t(key, v);
    return val === key ? fallback : val;
  };
  const activeFallback = POLICIES[activeKey];
  const title = pick(`policy.${activeKey}.title`, activeFallback.title);
  const intro = pick(`policy.${activeKey}.intro`, activeFallback.intro);
  const sections = [1, 2, 3].map((i) => {
    const fb = activeFallback.sections[i - 1] || { h: '', p: [''] };
    return {
      h: pick(`policy.${activeKey}.s${i}h`, fb.h),
      p: [pick(`policy.${activeKey}.s${i}p1`, fb.p[0], vars)],
    };
  });

  return (
    <InfoShell
      eyebrow={t('policy.eyebrow')}
      title={title}
      intro={intro}
      onNavigate={onNavigate}
    >
      <nav aria-label={t('policy.navLabel')} className="flex flex-wrap gap-2">
        {POLICY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate && onNavigate('info', { subPage: `policy-${key}` })}
            aria-current={key === activeKey ? 'page' : undefined}
            className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 break-words ${
              key === activeKey
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-900'
            }`}
          >
            {pick(`policy.${key}.title`, POLICIES[key].title)}
          </button>
        ))}
      </nav>
      {sections.map((s) => (
        <section key={s.h} className={`${swiss.panel} p-5`}>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 break-words min-w-0">{s.h}</h2>
          {s.p.map((para) => (
            <p key={para.slice(0, 24)} className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed break-words">
              {para}
            </p>
          ))}
        </section>
      ))}
    </InfoShell>
  );
}
