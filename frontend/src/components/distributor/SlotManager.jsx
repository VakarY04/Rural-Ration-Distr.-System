import { useState } from 'react';
import { Plus, Trash2, Clock, CalendarDays } from 'lucide-react';
import EditorShell from './EditorShell';
import { useLanguage } from '../../i18n/LanguageContext';
import { api } from '../../services/api';

const MAX_SLOTS = 8;
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';
const inputClass =
  'border border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-300 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-colors';

function cleanRow(row) {
  return {
    label: String(row?.label || '').trim(),
    capacity: Math.trunc(Number(row?.capacity)) || 0,
    isOpen: row?.isOpen !== false,
  };
}

// 7.2 — admin slot windows manager. Distributors get a read-only list +
// admin-only notice (7.1 matrix); admins get full Edit/Save/Cancel with
// label + per-slot cap + open/closed toggle, up to 8 windows — plus the fixed
// distribution date that locks citizens to time-slot-only booking.
export default function SlotManager({ slots, distributionDate = '', canEdit = false, onSaved }) {
  const { t, lang } = useLanguage();
  const initial = Array.isArray(slots) && slots.length
    ? slots.map(cleanRow)
    : [{ label: '', capacity: 6, isOpen: true }];
  const initialDate = distributionDate || '';

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [dateDraft, setDateDraft] = useState(initialDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const prettyDate = (iso) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const todayStr = new Date().toISOString().split('T')[0];

  const startEditing = () => {
    setDraft(initial);
    setDateDraft(initialDate);
    setError('');
    setEditing(true);
  };
  const cancelEditing = () => {
    setError('');
    setEditing(false);
  };
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api('/slots', 'PUT', { slots: draft.map(cleanRow), distributionDate: dateDraft });
      setEditing(false);
      onSaved?.();
      return true;
    } catch (e) {
      setError(e.message || 'Could not save changes.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (index, patch) =>
    setDraft(draft.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const rows = editing ? draft : initial;

  if (!canEdit) {
    return (
      <EditorShell title={t('slots.title')} readOnly>
        <div className="flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 mb-4">
          <CalendarDays size={15} className="text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {initialDate
              ? t('slots.fixedDate', { date: prettyDate(initialDate) })
              : t('slots.noDateSet')}
          </p>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.filter((r) => r.label).map((row, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="w-8 h-8 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0" aria-hidden="true">
                <Clock size={14} />
              </span>
              <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{row.label}</span>
              <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                {row.capacity} · {t('slots.capacity')}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border shrink-0 ${row.isOpen ? 'border-[#198754]/30 bg-[#198754]/10 text-[#198754] dark:text-emerald-400' : 'border-[#DC3545]/30 bg-[#DC3545]/10 text-[#DC3545] dark:text-red-400'}`}>
                {row.isOpen ? t('slots.open') : t('slots.closed')}
              </span>
            </li>
          ))}
        </ul>
        {rows.filter((r) => r.label).length === 0 && (
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">—</p>
        )}
        <p className="mt-4 border border-amber-200 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold px-3 py-2">
          {t('editor.adminOnly')}
        </p>
      </EditorShell>
    );
  }

  return (
    <EditorShell
      title={t('slots.title')}
      editing={editing}
      saving={saving}
      onEdit={startEditing}
      onSave={save}
      onCancel={cancelEditing}
      error={error}
    >
      <div className="space-y-1.5 mb-4">
        <label htmlFor="slot-date" className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><CalendarDays size={12} aria-hidden="true" /> {t('slots.dateLabel')}</span>
        </label>
        {editing ? (
          <>
            <input
              id="slot-date"
              type="date"
              min={todayStr}
              value={dateDraft}
              onChange={(e) => setDateDraft(e.target.value)}
              className={`${inputClass} cursor-pointer tabular-nums`}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('slots.dateHint')}</p>
          </>
        ) : (
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {initialDate ? prettyDate(initialDate) : t('slots.noDateSet')}
          </p>
        )}
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {draft.map((row, i) => (
          <li key={i} className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0 flex-wrap sm:flex-nowrap">
            <input
              aria-label={t('slots.labelAria', { n: i + 1 })}
              value={row.label}
              disabled={!editing}
              onChange={(e) => updateRow(i, { label: e.target.value })}
              placeholder={t('slots.labelPh')}
              className={`${inputClass} flex-1 min-w-0 disabled:bg-white dark:disabled:bg-slate-900 disabled:border-transparent disabled:px-0 disabled:font-semibold`}
            />
            <input
              aria-label={t('slots.capAria', { n: i + 1 })}
              type="number"
              min={1}
              max={100}
              disabled={!editing}
              value={row.capacity}
              onChange={(e) => updateRow(i, { capacity: e.target.value })}
              title={t('slots.capacity')}
              className={`${inputClass} w-20 tabular-nums disabled:bg-white dark:disabled:bg-slate-900 disabled:border-transparent disabled:px-0 disabled:font-extrabold`}
            />
            {editing ? (
              <>
                <label className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer ${FOCUS}`}>
                  <input
                    type="checkbox"
                    aria-label={t('slots.toggleAria', { n: i + 1 })}
                    checked={row.isOpen}
                    onChange={(e) => updateRow(i, { isOpen: e.target.checked })}
                    className="w-4 h-4 accent-[#198754] cursor-pointer"
                  />
                  {row.isOpen ? t('slots.open') : t('slots.closed')}
                </label>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((_, j) => j !== i))}
                  disabled={draft.length <= 1}
                  title={t('slots.remove', { n: i + 1 })}
                  aria-label={t('slots.remove', { n: i + 1 })}
                  className={`text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shrink-0 disabled:opacity-30 ${FOCUS}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </>
            ) : (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border shrink-0 ${row.isOpen ? 'border-[#198754]/30 bg-[#198754]/10 text-[#198754] dark:text-emerald-400' : 'border-[#DC3545]/30 bg-[#DC3545]/10 text-[#DC3545] dark:text-red-400'}`}>
                {row.isOpen ? t('slots.open') : t('slots.closed')}
              </span>
            )}
          </li>
        ))}
      </ul>

      {editing && draft.length < MAX_SLOTS && (
        <button
          type="button"
          onClick={() => setDraft([...draft, { label: '', capacity: 6, isOpen: true }])}
          className={`mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold tracking-wide py-2.5 transition-colors cursor-pointer ${FOCUS}`}
        >
          <Plus size={14} aria-hidden="true" />
          {t('slots.add')}
        </button>
      )}
    </EditorShell>
  );
}
