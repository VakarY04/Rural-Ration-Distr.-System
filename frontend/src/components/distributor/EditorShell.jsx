// Shared panel chrome for the two admin editors — Swiss hairline frame,
// section head, and a single action cluster (Edit / Save / Cancel). When
// `readOnly` is set the action cluster is omitted entirely (no Edit button),
// turning the panel into a static information card.
import { useLanguage } from '../../i18n/LanguageContext';

export default function EditorShell({ title, editing, saving, onEdit, onSave, onCancel, error, readOnly, children }) {
  const { t } = useLanguage();
  return (
    <section className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
      <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-slate-100">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-black break-words min-w-0">{title}</h2>

        {!readOnly && !editing && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 break-words"
          >
            {t('editor.edit')}
          </button>
        )}
        {!readOnly && editing && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="border border-slate-300 hover:border-slate-500 text-slate-700 text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              {t('editor.cancel')}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="bg-[#198754] hover:bg-[#157347] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#198754]"
            >
              {saving ? t('editor.saving') : t('editor.save')}
            </button>
          </div>
        )}
      </header>

      {error && (
        <p role="alert" className="mx-5 mt-4 bg-[#DC3545]/10 border border-[#DC3545]/40 text-[#DC3545] text-xs font-semibold px-3 py-2">
          {error}
        </p>
      )}

      <div className="p-5">{children}</div>
    </section>
  );
}
