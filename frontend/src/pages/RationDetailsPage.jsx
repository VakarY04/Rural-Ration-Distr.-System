import { FileCheck } from 'lucide-react';
import { swiss } from '../components/ui/swiss';
import { useLanguage } from '../i18n/LanguageContext';

// Minimal Ration Details view — shows the per-household entitlement items
// published to every citizen hub. Full item management is out of scope for
// this navigation step.
export default function RationDetailsPage({ items, updatedAt }) {
  const { t, lang } = useLanguage();
  const rows = Array.isArray(items) ? items : [];

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
          {t('ration.intro')}
        </p>
        {updatedAt && (
          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            {t('ration.lastReviewed', { date: new Date(updatedAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })}
          </p>
        )}
      </header>

      <section className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-5">
          {rows.length === 0 ? (
            <p className="text-sm font-semibold text-slate-900">{t('ration.empty')}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2">{t('ration.item')}</th>
                  <th scope="col" className="text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-32 pl-6">{t('ration.qty')}</th>
                  <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-24 pl-6">{t('ration.unit')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, i) => (
                  <tr key={item.key || item.label || i} className="border-t border-slate-100">
                    <td className="py-2 pr-3 text-sm font-semibold text-slate-900 text-left">{item.label}</td>
                    <td className="py-2 pl-6 pr-3 text-sm font-bold text-slate-900 tabular-nums text-right">{item.quantity}</td>
                    <td className="py-2 pl-6 pr-3 text-xs font-bold uppercase text-slate-500 text-left">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
