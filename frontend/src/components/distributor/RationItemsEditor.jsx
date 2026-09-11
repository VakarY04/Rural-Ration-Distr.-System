import { Plus, Trash2, Wheat } from 'lucide-react';
import EditorShell from './EditorShell';
import { useLanguage } from '../../i18n/LanguageContext';
import { useEditableSection } from './useEditableSection';

// "Ration items & quantity" editor — the second citizen-facing configuration
// beside delivery details. Each row is a name + quantity + unit where the
// unit is chosen (not typed) from KG or Litre, so citizen hubs always show a
// clean, consistent unit. Mirrors DeliveryDetailsEditor behaviour exactly.

const MAX_ITEMS = 12;
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';
const inputClass =
  'border border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors';

function cleanRow(row) {
  return {
    label: String(row?.label || '').trim(),
    quantity: Math.max(Number(row?.quantity) || 0, 0),
    unit: row?.unit === 'litre' ? 'litre' : 'kg',
  };
}

export default function RationItemsEditor({ items, onSaved, canEdit = false }) {
  const { t } = useLanguage();
  const UNITS = [
    { value: 'kg', label: t('items.kg') },
    { value: 'litre', label: t('items.litre') },
  ];
  const initial = Array.isArray(items) && items.length
    ? items.map(cleanRow)
    : [{ label: '', quantity: 0, unit: 'kg' }];

  const section = useEditableSection({
    endpoint: '/distributor/items',
    buildPayload: (draft) => ({ items: draft.map(cleanRow).filter((r) => r.label) }),
    initial,
    onSaved,
  });

  const { editing, draft, setDraft } = section;
  const updateRow = (index, patch) =>
    setDraft(draft.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  // 7.1 matrix: distributors see the list read-only; only admins get Edit.
  if (!canEdit) {
    return (
      <EditorShell title={t('items.title')} readOnly>
        {draft.filter((r) => r.label).length === 0 && (
          <p className="text-sm font-semibold text-slate-900 break-words">{t('items.empty')}</p>
        )}
        <ul className="divide-y divide-slate-100">
          {draft.filter((r) => r.label).map((row, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="w-8 h-8 border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center shrink-0" aria-hidden="true">
                <Wheat size={14} />
              </span>
              <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{row.label}</span>
              <span className="text-sm font-extrabold tracking-tight tabular-nums text-slate-900 shrink-0">
                {row.quantity} {row.unit === 'litre' ? 'L' : 'kg'}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-2">
          {t('editor.adminOnly')}
        </p>
      </EditorShell>
    );
  }

  return (
    <EditorShell
      title={t('items.title')}
      editing={section.editing}
      saving={section.saving}
      onEdit={section.startEditing}
      onSave={section.save}
      onCancel={section.cancelEditing}
      error={section.error}
    >
      {!editing && draft.filter((r) => r.label).length === 0 && (
        <p className="text-sm font-semibold text-slate-900 break-words">{t('items.empty')}</p>
      )}

      <ul className="divide-y divide-slate-100">
        {draft.filter((r) => editing || r.label).map((row, i) => (
          <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            {editing ? (
              <>
                <input
                  aria-label={t('items.nameAria', { n: i + 1 })}
                  value={row.label}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  placeholder={t('items.namePh')}
                  className={`${inputClass} flex-1 min-w-0`}
                />
                <input
                  aria-label={t('items.qtyAria', { n: i + 1 })}
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={(e) => updateRow(i, { quantity: e.target.value })}
                  className={`${inputClass} w-20 tabular-nums`}
                />
                <select
                  aria-label={t('items.unitAria', { n: i + 1 })}
                  value={row.unit}
                  onChange={(e) => updateRow(i, { unit: e.target.value })}
                  title={t('items.unitTitle', { n: i + 1 })}
                  className={`${inputClass} cursor-pointer w-24`}
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((_, j) => j !== i))}
                  title={t('items.remove', { n: i + 1 })}
                  aria-label={t('items.remove', { n: i + 1 })}
                  className={`text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 cursor-pointer transition-colors shrink-0 ${FOCUS}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <span className="w-8 h-8 border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Wheat size={14} />
                </span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{row.label}</span>
                <span className="text-sm font-extrabold tracking-tight tabular-nums text-slate-900 shrink-0">
                  {row.quantity} {row.unit === 'litre' ? 'L' : 'kg'}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      {editing && draft.length < MAX_ITEMS && (
        <button
          type="button"
          onClick={() => setDraft([...draft, { label: '', quantity: 0, unit: 'kg' }])}
          className={`mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-50 text-slate-500 hover:text-slate-900 text-xs font-semibold tracking-wide py-2.5 transition-colors cursor-pointer ${FOCUS}`}
        >
          <Plus size={14} aria-hidden="true" />
          {t('items.add')}
        </button>
      )}
    </EditorShell>
  );
}
