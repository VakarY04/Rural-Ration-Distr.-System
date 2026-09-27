import { FileCheck } from 'lucide-react';
import { swiss } from '../components/ui/swiss';
import { useLanguage } from '../i18n/LanguageContext';
import DeliveryDetailsEditor from '../components/distributor/DeliveryDetailsEditor';
import RationItemsEditor from '../components/distributor/RationItemsEditor';

// Ration Details view — the two editable configurations (ration items +
// delivery details) that used to live on the staff Home page. Admins can edit
// both here; distributors see both read-only.
export default function RationDetailsPage({
  items,
  delivery,
  updatedAt,
  canEditItems = false,
  canEditDelivery = false,
  onSaved,
}) {
  const { t, lang } = useLanguage();
  const canEditAny = canEditItems || canEditDelivery;

  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('ration.eyebrow')}</p>
        <h1 className={`${swiss.headline} flex items-center gap-2.5`}>
          <span className="w-9 h-9 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0" aria-hidden="true">
            <FileCheck size={17} />
          </span>
          {t('ration.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          {canEditAny ? t('ration.introAdmin') : t('ration.intro')}
        </p>
        {updatedAt && (
          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            {t('ration.lastReviewed', { date: new Date(updatedAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })}
          </p>
        )}
      </header>

      {/* Ration configuration — editing lives here, not on the Home page */}
      {(delivery || canEditAny) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <DeliveryDetailsEditor
            key={`ration-delivery-${updatedAt || 'init'}`}
            delivery={delivery}
            onSaved={onSaved}
            canEdit={canEditDelivery}
          />
          <RationItemsEditor
            key={`ration-items-${updatedAt || 'init'}`}
            items={items}
            onSaved={onSaved}
            canEdit={canEditItems}
          />
        </div>
      )}
    </div>
  );
}
