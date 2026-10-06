import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';
const inputClass =
  'border border-slate-200 focus:border-slate-900 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none transition-colors';

const CATEGORIES = ['Quantity', 'Quality', 'Access', 'Corruption', 'Technical', 'Other'];

function statusStyle(status) {
  if (status === 'Resolved') return 'border-[#198754]/30 bg-[#198754]/10 text-[#198754]';
  if (status === 'In Review') return 'border-[#0D6EFD]/30 bg-[#0D6EFD]/10 text-[#0D6EFD]';
  return 'border-amber-300 bg-amber-50 text-amber-700';
}

function statusKey(status, t) {
  if (status === 'In Review') return t('grievance.statusReview');
  if (status === 'Resolved') return t('grievance.statusResolved');
  return t('grievance.statusOpen');
}

// 7.3 — staff grievance queue. Lists AI-triaged tickets with a status filter;
// each row lets staff re-categorise, assign, set status and write the
// resolution note the citizen sees (email follows on resolve when configured).
export default function GrievanceQueue() {
  const { t, lang } = useLanguage();
  // Category codes are stored in English — map to the active language for
  // display (stored values stay English so filtering keeps working).
  const categoryLabel = (category) => {
    const map = {
      quantity: 'grievance.catQuantity',
      quality: 'grievance.catQuality',
      access: 'grievance.catAccess',
      corruption: 'grievance.catCorruption',
      technical: 'grievance.catTechnical',
      other: 'grievance.catOther',
    };
    const key = map[String(category || '').trim().toLowerCase()];
    return key ? t(key) : String(category || '');
  };
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState('');

  const load = useCallback(() => {
    setError('');
    const q = filter ? `?status=${encodeURIComponent(filter)}` : '';
    return api(`/grievances${q}`)
      .then((data) => {
        setItems(data.grievances || []);
        setStats(data.stats || null);
      })
      .catch((e) => setError(e.message || 'Request failed'));
  }, [filter]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const draftFor = (g) =>
    drafts[g.id] || { status: g.status, assignedTo: g.assignedTo || '', resolution: g.resolution || '', category: g.category };
  const setDraft = (id, patch) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...draftFor(items.find((x) => x.id === id) || {}), ...patch } }));

  const save = async (g) => {
    const d = draftFor(g);
    if (d.status === 'Resolved' && !String(d.resolution || '').trim()) {
      setError(t('grievance.resolutionPh'));
      return;
    }
    setSavingId(g.id);
    setError('');
    try {
      await api(`/grievances/${g.id}`, 'PATCH', {
        status: d.status,
        assignedTo: d.assignedTo,
        resolution: d.resolution,
        category: d.category,
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[g.id];
        return next;
      });
      await load();
    } catch (e) {
      setError(e.message || 'Request failed');
    } finally {
      setSavingId('');
    }
  };

  const filters = [
    { value: '', label: `${t('grievance.filterAll')}${stats ? ` (${stats.total})` : ''}` },
    { value: 'Open', label: `${t('grievance.statusOpen')}${stats ? ` (${stats.Open})` : ''}` },
    { value: 'In Review', label: `${t('grievance.statusReview')}${stats ? ` (${stats['In Review']})` : ''}` },
    { value: 'Resolved', label: `${t('grievance.statusResolved')}${stats ? ` (${stats.Resolved})` : ''}` },
  ];

  return (
    <section aria-label={t('grievance.title')} className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
      <header className="px-5 pt-5 pb-4 border-b border-slate-100 space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-black break-words">{t('grievance.title')}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{t('grievance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={t('grievance.title')}>
          {filters.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors cursor-pointer ${FOCUS} ${filter === f.value ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setLoading(true); load().finally(() => setLoading(false)); }}
            className={`ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 cursor-pointer ${FOCUS}`}
          >
            <RefreshCw size={12} aria-hidden="true" className={loading ? 'animate-spin' : ''} />
            {t('common.retry')}
          </button>
        </div>
      </header>

      <div className="p-5">
        {error && (
          <p role="alert" className="mb-4 bg-[#DC3545]/10 border border-[#DC3545]/40 text-[#DC3545] text-xs font-semibold px-3 py-2">
            {error}
          </p>
        )}
        {loading ? (
          <p className="py-10 text-center text-sm font-semibold text-slate-500">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <Inbox size={22} className="mx-auto text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-900">{t('grievance.empty')}</p>
          </div>
        ) : (
          <ol className="divide-y divide-slate-100">
            {items.map((g) => {
              const d = draftFor(g);
              const saving = savingId === g.id;
              return (
                <li key={g.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border shrink-0 ${statusStyle(g.status)}`}>
                      {statusKey(g.status, t)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 border border-slate-300 text-slate-600 shrink-0">
                      {g.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium tabular-nums ml-auto">
                      #{String(g.id).slice(-6).toUpperCase()} · {new Date(g.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug break-words">{g.issue}</p>
                  {g.aiAction && (
                    <p className="text-xs text-slate-500 break-words">AI: {g.aiAction}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      aria-label={t('grievance.statusAria', { n: String(g.id).slice(-6) })}
                      value={d.status}
                      onChange={(e) => setDraft(g.id, { status: e.target.value })}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="Open">{t('grievance.statusOpen')}</option>
                      <option value="In Review">{t('grievance.statusReview')}</option>
                      <option value="Resolved">{t('grievance.statusResolved')}</option>
                    </select>
                    <select
                      aria-label={t('grievance.categoryAria', { n: String(g.id).slice(-6) })}
                      value={d.category}
                      onChange={(e) => setDraft(g.id, { category: e.target.value })}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{categoryLabel(c)}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    aria-label={t('grievance.assignAria', { n: String(g.id).slice(-6) })}
                    value={d.assignedTo}
                    onChange={(e) => setDraft(g.id, { assignedTo: e.target.value })}
                    placeholder={t('grievance.assignPh')}
                    maxLength={120}
                    className={`${inputClass} w-full`}
                  />
                  <textarea
                    aria-label={t('grievance.resolutionAria', { n: String(g.id).slice(-6) })}
                    value={d.resolution}
                    onChange={(e) => setDraft(g.id, { resolution: e.target.value })}
                    placeholder={t('grievance.resolutionPh')}
                    rows={2}
                    maxLength={1000}
                    className={`${inputClass} w-full resize-none`}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => save(g)}
                      disabled={saving}
                      className={`bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer disabled:opacity-50 ${FOCUS}`}
                    >
                      {saving ? t('grievance.updating') : t('grievance.update')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
