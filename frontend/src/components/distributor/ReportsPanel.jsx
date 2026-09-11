import { useState, useEffect, useCallback } from 'react';
import { Download, Table2 } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// 7.4 — district reports: entitlement vs allocation vs collection per
// district with totals + CSV export. Staff only (mounted in the console).
export default function ReportsPanel() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    () => api('/reports').then(setData).catch((e) => setError(e.message || 'Request failed')),
    []
  );

  useEffect(() => {
    let active = true;
    load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('ration_user_token');
      const res = await fetch(`${API_URL}/reports/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eration-district-report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Request failed');
    } finally {
      setExporting(false);
    }
  };

  const totals = data?.totals;
  const rows = data?.districts || [];

  return (
    <section aria-label={t('reports.title')} className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
      <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-slate-100 flex-wrap">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#000080] break-words">{t('reports.title')}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{t('reports.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={exporting || loading || rows.length === 0}
          className={`shrink-0 bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 ${FOCUS}`}
        >
          <Download size={13} aria-hidden="true" />
          {exporting ? t('reports.exporting') : t('reports.export')}
        </button>
      </header>

      <div className="p-5">
        {error && (
          <p role="alert" className="mb-4 bg-[#DC3545]/10 border border-[#DC3545]/40 text-[#DC3545] text-xs font-semibold px-3 py-2">
            {error}
          </p>
        )}
        {loading ? (
          <p className="py-10 text-center text-sm font-semibold text-slate-500">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center">
            <Table2 size={22} className="mx-auto text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-900">{t('reports.empty')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 text-xs mb-4">
              {[
                [t('reports.entitled'), totals?.entitledKg ?? 0],
                [t('reports.allocated'), totals?.allocatedKg ?? 0],
                [t('reports.collected'), totals?.collectedKg ?? 0],
                [t('reports.rate'), `${totals?.collectionRate ?? 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                  <p className="text-lg font-extrabold tracking-tight text-slate-900 tabular-nums mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    {[t('reports.district'), t('reports.families'), t('reports.entitled'), t('reports.allocated'), t('reports.collected'), t('reports.rate'), t('reports.bookings')].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.district} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-bold text-slate-900 break-words">{r.district}</td>
                      <td className="px-3 py-2 tabular-nums">{r.families}</td>
                      <td className="px-3 py-2 tabular-nums">{r.entitledKg}</td>
                      <td className="px-3 py-2 tabular-nums">{r.allocatedKg}</td>
                      <td className="px-3 py-2 tabular-nums">{r.collectedKg}</td>
                      <td className="px-3 py-2 tabular-nums">{r.collectionRate}%</td>
                      <td className="px-3 py-2 tabular-nums">{r.bookings}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="px-3 py-2">{t('reports.total')}</td>
                    <td className="px-3 py-2 tabular-nums">{totals?.families ?? 0}</td>
                    <td className="px-3 py-2 tabular-nums">{totals?.entitledKg ?? 0}</td>
                    <td className="px-3 py-2 tabular-nums">{totals?.allocatedKg ?? 0}</td>
                    <td className="px-3 py-2 tabular-nums">{totals?.collectedKg ?? 0}</td>
                    <td className="px-3 py-2 tabular-nums">{totals?.collectionRate ?? 0}%</td>
                    <td className="px-3 py-2 tabular-nums">{totals?.bookings ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
