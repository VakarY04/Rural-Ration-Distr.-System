import { CalendarCheck, Users, Bot, PhoneCall, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { swiss } from '../../components/ui/swiss';
import { siteMeta } from '../../config/siteMeta';
import InfoShell from './InfoShell';

export default function HelpPage({ onNavigate }) {
  const { t } = useLanguage();
  // Security-contact paragraph: interpolated email renders as a mailto link
  // so the incident contact is one tap away (Phase 6.5).
  const secBody = t('help.security.body', { email: siteMeta.ownerEmail });
  const [secBefore, secAfter = ''] = secBody.split(siteMeta.ownerEmail);
  const GUIDES = [
    {
      icon: Users,
      title: t('help.guide1.title'),
      steps: [t('help.guide1.s1'), t('help.guide1.s2'), t('help.guide1.s3')],
    },
    {
      icon: CalendarCheck,
      title: t('help.guide2.title'),
      steps: [t('help.guide2.s1'), t('help.guide2.s2'), t('help.guide2.s3')],
    },
    {
      icon: Bot,
      title: t('help.guide3.title'),
      steps: [t('help.guide3.s1'), t('help.guide3.s2'), t('help.guide3.s3')],
    },
  ];
  return (
    <InfoShell
      eyebrow={t('help.eyebrow')}
      title={t('help.title')}
      intro={t('help.intro')}
      onNavigate={onNavigate}
    >
      {GUIDES.map(({ icon: Icon, title, steps }) => (
        <section key={title} className={swiss.panel}>
          <div className="p-5 flex items-start gap-3">
            <span className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0" aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 break-words">{title}</h2>
              <ol className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ))}
      <section className={`${swiss.panel} p-5 flex items-center gap-3`}>
        <PhoneCall size={18} className="text-orange-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-slate-600 dark:text-slate-300 break-words min-w-0">
          {t('help.urgent')}
        </p>
      </section>
      <section className={`${swiss.panel} p-5 flex items-start gap-3`}>
        <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 break-words">{t('help.security.title')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {secBefore}
            <a
              href={`mailto:${siteMeta.ownerEmail}?subject=${encodeURIComponent('SECURITY: vulnerability report')}`}
              className="font-semibold text-blue-700 dark:text-blue-400 underline underline-offset-2 break-all"
            >
              {siteMeta.ownerEmail}
            </a>
            {secAfter}
          </p>
        </div>
      </section>
    </InfoShell>
  );
}
