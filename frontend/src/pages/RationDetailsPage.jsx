import { swiss } from '../components/ui/swiss';

// Minimal Ration Details view — shows the per-household entitlement items
// published to every citizen hub. Full item management is out of scope for
// this navigation step.
export default function RationDetailsPage({ items }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>Entitlement records · राशन विवरण</p>
        <h1 className={swiss.headline}>Ration Details</h1>
        <p className="text-sm text-slate-500 mt-2">
          Per-household ration entitlement shown to citizens at booking and on the Terminal Hub.
        </p>
      </header>

      <section className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-5">
          {rows.length === 0 ? (
            <p className="text-sm font-semibold text-slate-900">No ration items configured.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2">Item</th>
                  <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-24">Qty</th>
                  <th scope="col" className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pb-2 w-16">Unit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, i) => (
                  <tr key={item.key || item.label || i} className="border-t border-slate-100">
                    <td className="py-2 pr-3 text-sm font-semibold text-slate-900">{item.label}</td>
                    <td className="py-2 pr-3 text-sm font-bold text-slate-900 tabular-nums">{item.quantity}</td>
                    <td className="py-2 pr-3 text-xs font-bold uppercase text-slate-500">{item.unit}</td>
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
