import { useState } from 'react';
import { FileCheck, Wheat, Plus, Trash2 } from 'lucide-react';
import { swissUser as swiss } from '../components/ui/swiss';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { useEditableSection } from '../components/distributor/useEditableSection';
import DeliveryDetailsEditor from '../components/distributor/DeliveryDetailsEditor';
import RationItemsEditor from '../components/distributor/RationItemsEditor';
import SlotManager from '../components/distributor/SlotManager';

const MAX_COMMITTED_ITEMS = 12;
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

// Admin-typed labels stay English in storage; known PDS staples render in
// the active language, anything custom shows as typed.
function itemName(t, label) {
  const map = {
    rice: 'items.nameRice',
    wheat: 'items.nameWheat',
    oil: 'items.nameOil',
    sugar: 'items.nameSugar',
    salt: 'items.nameSalt',
    pulses: 'items.namePulses',
    pulse: 'items.namePulses',
    dal: 'items.namePulses',
    kerosene: 'items.nameKerosene',
    'coarse grain': 'items.nameCoarseGrain',
    coarsegrain: 'items.nameCoarseGrain',
    millet: 'items.nameCoarseGrain',
    millets: 'items.nameCoarseGrain',
  };
  const key = map[String(label || '').trim().toLowerCase()];
  return key ? t(key) : String(label || '');
}

// Total committed ration — computed (per-member rate × booked members) unless
// the admin saved a manual override. Editing + reset are admin-only
// (PUT /distributor/committed is requireAdmin; distributors get canEdit false
// and see the static list). Override labels stay as the admin typed them;
// known staples display translated via itemName.
function CommittedTotals({ items, customized = false, canEdit = false, onSaved }) {
  const { t } = useLanguage();
  const UNITS = [
    { value: 'kg', label: t('items.kg') },
    { value: 'litre', label: t('items.litre') },
  ];
  const unitLabel = (unit) => (unit === 'litre' ? t('items.litre') : t('items.kg'));
  const rows = (Array.isArray(items) ? items : []).filter((r) => r && String(r.label || '').trim());
  const section = useEditableSection({
    endpoint: '/distributor/committed',
    buildPayload: (draft) => ({ items: draft.map(cleanRow).filter((r) => r.label) }),
    initial: rows.map(cleanRow),
    onSaved,
  });
  const { editing, draft, setDraft } = section;
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const updateRow = (index, patch) =>
    setDraft(draft.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const resetToAuto = async () => {
    setResetting(true);
    setResetError('');
    try {
      await api('/distributor/committed', 'PUT', { items: [] });
      onSaved?.();
    } catch (e) {
      setResetError(e.message || 'Could not save changes.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <section aria-label={t('items.committedTitle')} className="border border-[#198754]/30 bg-[#198754]/5 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 border border-[#198754]/30 bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0" aria-hidden="true">
            <Wheat size={15} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#198754] break-words">{t('items.committedTitle')}</h2>
          </div>
        </div>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={section.startEditing}
            className={`shrink-0 bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer ${FOCUS}`}
          >
            {t('editor.edit')}
          </button>
        )}
        {canEdit && editing && (
          <div className="flex shrink-0 gap-2 flex-wrap">
            {customized && (
              <button
                type="button"
                onClick={resetToAuto}
                disabled={resetting || section.saving}
                title={t('editor.reset')}
                className={`border border-[#DC3545]/50 text-[#DC3545] hover:bg-[#DC3545] hover:text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 ${FOCUS}`}
              >
                {resetting ? t('editor.saving') : t('editor.reset')}
              </button>
            )}
            <button
              type="button"
              onClick={section.cancelEditing}
              disabled={section.saving}
              className={`border border-slate-300 hover:border-slate-500 text-slate-700 text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 ${FOCUS}`}
            >
              {t('editor.cancel')}
            </button>
            <button
              type="button"
              onClick={section.save}
              disabled={section.saving}
              className={`bg-[#198754] hover:bg-[#157347] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 ${FOCUS}`}
            >
              {section.saving ? t('editor.saving') : t('editor.save')}
            </button>
          </div>
        )}
      </div>
      {(section.error || resetError) && (
        <p role="alert" className="mt-3 bg-[#DC3545]/10 border border-[#DC3545]/40 text-[#DC3545] text-xs font-semibold px-3 py-2">
          {section.error || resetError}
        </p>
      )}
      <div className="mt-4">
        {!editing && rows.length === 0 && (
          <p className="text-sm text-slate-500">{t('items.committedEmpty')}</p>
        )}
        {!editing && rows.length > 0 && (
          <ul className="divide-y divide-[#198754]/15">
            {rows.map((row, i) => (
              <li key={`${row.label}-${i}`} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="text-sm font-semibold text-slate-800 truncate">{itemName(t, row.label)}</span>
                <span className="text-base font-extrabold tracking-tight tabular-nums text-slate-900 shrink-0">
                  {row.quantity} {unitLabel(row.unit)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {editing && (
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-slate-500">{t('items.committedHint')}</p>
            <ul className="divide-y divide-slate-100">
              {draft.map((row, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
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
                </li>
              ))}
            </ul>
            {draft.length < MAX_COMMITTED_ITEMS && (
              <button
                type="button"
                onClick={() => setDraft([...draft, { label: '', quantity: 0, unit: 'kg' }])}
                className={`w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-slate-900 hover:bg-white text-slate-500 hover:text-slate-900 text-xs font-semibold tracking-wide py-2.5 transition-colors cursor-pointer ${FOCUS}`}
              >
                <Plus size={14} aria-hidden="true" />
                {t('items.add')}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Ration Details view — the three editable configurations (ration items,
// delivery details + slot windows for the next ration availability) that used
// to live on the staff Home page. Admins can edit all three here;
// distributors see everything read-only.
export default function RationDetailsPage({
  items,
  delivery,
  slots,
  distributionDate = '',
  updatedAt,
  canEditItems = false,
  canEditDelivery = false,
  canManageSlots = false,
  committedItems = [],
  canEditCommitted = false,
  committedCustomized = false,
  onSaved,
}) {
  const { t } = useLanguage();
  const canEditAny = canEditItems || canEditDelivery || canManageSlots;

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

      {/* Committed totals — computed unless the admin overrode them; editing
          + reset are admin-only, distributors see the static list */}
      <CommittedTotals items={committedItems} customized={committedCustomized} canEdit={canEditCommitted} onSaved={onSaved} />

      {/* Slot windows — when the next ration is available and in which time
          windows. Admin-edited; distributors see the list read-only. */}
      <SlotManager
        key={`ration-slots-${updatedAt || 'init'}`}
        slots={slots}
        distributionDate={distributionDate}
        canEdit={canManageSlots}
        onSaved={onSaved}
      />
    </div>
  );
}
