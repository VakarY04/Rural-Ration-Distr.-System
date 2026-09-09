import { MapPin } from 'lucide-react';
import EditorShell from './EditorShell';
import { useLanguage } from '../../i18n/LanguageContext';
import { useEditableSection } from './useEditableSection';

const EMPTY = { from: { label: '', address: '' }, to: { label: '', address: '' } };

const Field = { wrapper: 'space-y-1.5', label: 'text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500' };
const inputClass =
  'w-full border border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors';

function RouteField({ side, value, onChange, editing }) {
  const { t } = useLanguage();
  return (
    <div className="min-w-0">
      <p className={Field.label}>{side}</p>
      {editing ? (
        <div className="mt-2 space-y-2">
          <input
            aria-label={t('delivery.labelAria', { side })}
            className={inputClass}
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
            placeholder={t('delivery.namePh')}
          />
          <input
            aria-label={t('delivery.addressAria', { side })}
            className={inputClass}
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder={t('delivery.addressPh')}
          />
        </div>
      ) : (
        <div className="mt-1.5 flex items-start gap-2">
          <MapPin size={14} className="text-orange-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-snug break-words">{value.label || '—'}</p>
            <p className="text-xs text-slate-500 leading-snug break-words">{value.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeliveryDetailsEditor({ delivery, onSaved }) {
  const { t } = useLanguage();
  const initial = delivery?.from ? delivery : EMPTY;

  const section = useEditableSection({
    endpoint: '/distributor/delivery',
    buildPayload: (d) => ({ from: d.from, to: d.to }),
    initial,
    onSaved,
  });

  return (
    <EditorShell title={t('delivery.title')} readOnly>
      <dl className="space-y-4">
        <RouteField side={t('delivery.from')} value={section.draft.from} onChange={() => {}} editing={false} />
        <RouteField side={t('delivery.to')} value={section.draft.to} onChange={() => {}} editing={false} />
      </dl>
    </EditorShell>
  );
}
