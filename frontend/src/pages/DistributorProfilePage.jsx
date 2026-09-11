import { swiss } from '../components/ui/swiss';
import { Avatar } from '../components/ui/avatar';
import { useLanguage } from '../i18n/LanguageContext';

// Staff profile — shows the 7.1 roles matrix identity (role + shop) so a
// distributor can see why config panels are read-only.
export default function DistributorProfilePage({ name, role, shopId, isAdmin }) {
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
            {shopId && (
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-0.5">
                {shopId}
              </p>
            )}
          </div>
        </div>
        {!isAdmin && (
          <p className="mx-6 mb-6 border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-2">
            {t('editor.adminOnly')}
          </p>
        )}
      </section>
    </div>
  );
}
