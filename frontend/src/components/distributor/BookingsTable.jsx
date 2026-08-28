// Booked families queue — Swiss index list showing only each family's
// head of household, numbered like a ledger register. Families are
// deduplicated by their unique ration card number so the same card never
// appears twice, while two different cards that happen to share a family
// name are both retained.
export default function BookingsTable({ bookings }) {
  if (!bookings?.length) {
    return (
      <div className="border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-900">No bookings yet</p>
        <p className="text-xs text-slate-400 mt-1">कोई बुकिंग उपलब्ध नहीं — citizen reservations will appear here.</p>
      </div>
    );
  }

  // Deduplicate by ration card number, preserving first-seen order.
  const seen = new Set();
  const unique = [];
  for (const b of bookings) {
    const key = b.rationCardNumber || b.id;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(b);
  }

  return (
    <ol className="border border-slate-200 bg-white divide-y divide-slate-100" aria-label="Booked families">
      {unique.map((b, i) => (
        <li
          key={b.rationCardNumber || b.id}
          className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-400 tabular-nums w-6 shrink-0" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{b.headOfFamily}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // TODO: wire up to a family details view when available.
            }}
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            View details
          </button>
        </li>
      ))}
    </ol>
  );
}
