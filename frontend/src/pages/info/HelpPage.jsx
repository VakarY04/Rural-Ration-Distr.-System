import { CalendarCheck, Users, Bot, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { swiss } from '../../components/ui/swiss';
import InfoShell from './InfoShell';

export default function HelpPage({ onNavigate }) {
  const { t } = useLanguage();
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
            <span className="w-9 h-9 border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0" aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 break-words">{title}</h2>
              <ol className="mt-2 space-y-1.5 text-sm text-slate-600 list-decimal list-inside">
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
        <p className="text-sm text-slate-600 break-words min-w-0">
          {t('help.urgent')}
        </p>
      </section>
    </InfoShell>
  );
}
