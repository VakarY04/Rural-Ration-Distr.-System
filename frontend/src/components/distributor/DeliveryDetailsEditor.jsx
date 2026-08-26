import { MapPin } from 'lucide-react';
import EditorShell from './EditorShell';
import { useEditableSection } from './useEditableSection';

const EMPTY = { from: { label: '', address: '' }, to: { label: '', address: '' } };

const Field = { wrapper: 'space-y-1.5', label: 'text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500' };
const inputClass =
  'w-full border border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors';

function RouteField({ side, value, onChange, editing }) {
  return (
    <div>
      <p className={Field.label}>{side}</p>
      {editing ? (
        <div className="mt-2 space-y-2">
          <input
            aria-label={`${side} label`}
            className={inputClass}
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
            placeholder="Facility name"
          />
          <input
            aria-label={`${side} address`}
            className={inputClass}
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="Full address"
          />
        </div>
      ) : (
        <div className="mt-1.5 flex items-start gap-2">
          <MapPin size={14} className="text-orange-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">{value.label || '—'}</p>
            <p className="text-xs text-slate-500 leading-snug">{value.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeliveryDetailsEditor({ delivery, onSaved }) {
  const initial = delivery?.from ? delivery : EMPTY;

  const section = useEditableSection({
    endpoint: '/distributor/delivery',
    buildPayload: (d) => ({ from: d.from, to: d.to }),
    initial,
    onSaved,
  });

  const setEndpoint = (side) => (value) => section.setDraft((d) => ({ ...d, [side]: value }));

  return (
    <EditorShell
      title="Ration delivery details"
      editing={section.editing}
      saving={section.saving}
      error={section.error}
      onEdit={section.startEditing}
      onCancel={section.cancelEditing}
      onSave={section.save}
    >
      {section.editing ? (
        <div className="space-y-5">
          <RouteField side="From warehouse" value={section.draft.from} onChange={setEndpoint('from')} editing />
          <RouteField side="To collection centre" value={section.draft.to} onChange={setEndpoint('to')} editing />
        </div>
      ) : (
        <dl className="space-y-4">
          <RouteField side="From warehouse" value={section.draft.from} onChange={() => {}} editing={false} />
          <RouteField side="To collection centre" value={section.draft.to} onChange={() => {}} editing={false} />
        </dl>
      )}
    </EditorShell>
  );
}
