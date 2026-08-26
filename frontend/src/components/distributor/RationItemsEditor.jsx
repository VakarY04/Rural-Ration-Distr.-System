import { Plus, X } from 'lucide-react';
import EditorShell from './EditorShell';
import { useEditableSection } from './useEditableSection';

const inputClass =
  'w-full border border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors';

const newRow = () => ({ key: `draft-${Date.now()}`, label: '', quantity: '', unit: 'kg' });

// Admin editor for "Ration Items & Quantity" — the per-household entitlement
// lines every citizen sees on their Terminal Hub.
export default function RationItemsEditor({ items, onSaved }) {
  const initial = items?.length ? items : [newRow()];

  const section = useEditableSection({
    endpoint: '/distributor/items',
    buildPayload: (d) => ({
      items: d.map((i) => ({ label: i.label, quantity: Number(i.quantity), unit: i.unit })),
    }),
    initial,
    onSaved,
  });

  const updateRow = (key, patch) =>
    section.setDraft((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <EditorShell
      title="Ration items & quantity"
      editing={section.editing}
      saving={section.saving}
      error={section.error}
      onEdit={section.startEditing}
      onCancel={section.cancelEditing}
      onSave={section.save}
    >
      <table className="w-full">
        <thead>
          <tr>
            <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2">Item</th>
            <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-24">Qty</th>
            <th scope="col" className="sr-only">Unit</th>
            <th scope="col" className="w-8"><span className="sr-only">Remove</span></th>
          </tr>
        </thead>
        <tbody>
          {section.draft.map((item) => (
            <tr key={item.key} className="border-t border-slate-100">
              <td className="py-2 pr-3">
                {section.editing ? (
                  <input
                    aria-label="Item name"
                    className={inputClass}
                    value={item.label}
                    onChange={(e) => updateRow(item.key, { label: e.target.value })}
                    placeholder="e.g. Rice"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                )}
              </td>
              <td className="py-2 pr-3">
                {section.editing ? (
                  <input
                    aria-label="Quantity"
                    type="number"
                    min="0"
                    step="0.5"
                    className={`${inputClass} tabular-nums`}
                    value={item.quantity}
                    onChange={(e) => updateRow(item.key, { quantity: e.target.value })}
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{item.quantity}</span>
                )}
              </td>
              <td className="py-2 pr-3 text-xs font-bold uppercase text-slate-500">{item.unit}</td>
              <td className="py-2">
                {section.editing && section.draft.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.label || 'item'}`}
                    onClick={() => section.setDraft((rows) => rows.filter((r) => r.key !== item.key))}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {section.editing && (
        <button
          type="button"
          onClick={() => section.setDraft((rows) => [...rows, newRow()])}
          className="mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          <Plus size={14} /> Add item
        </button>
      )}

      {!section.editing && (
        <p className="text-[11px] text-slate-400 mt-4">
          Per-household entitlement shown to citizens at booking and on the Terminal Hub.
        </p>
      )}
    </EditorShell>
  );
}
