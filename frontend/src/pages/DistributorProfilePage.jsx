import { swiss } from '../components/ui/swiss';
import { Avatar } from '../components/ui/avatar';
import { useLanguage } from '../i18n/LanguageContext';

// Minimal Distributor profile view. Reuses the shared design system; full
// profile editing is out of scope for this navigation step.
export default function DistributorProfilePage({ name, role }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('staff.eyebrow')}</p>
        <h1 className={swiss.headline}>{t('staff.title')}</h1>
        <p className="text-sm text-slate-500 mt-2">{t('staff.intro')}</p>
      </header>

      <section className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center gap-4 p-6">
          <Avatar src={null} name={name} size={56} />
          <div>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">{name}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-0.5">
              {t('staff.portalSuffix', { role: role || t('staff.fallback') })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
