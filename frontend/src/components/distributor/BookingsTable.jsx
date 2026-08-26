// Booked families queue — Swiss index list showing only each family's
// head of household, numbered like a ledger register.
export default function BookingsTable({ bookings }) {
  if (!bookings?.length) {
    return (
      <div className="border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-900">No bookings yet</p>
        <p className="text-xs text-slate-400 mt-1">कोई बुकिंग उपलब्ध नहीं — citizen reservations will appear here.</p>
      </div>
    );
  }

  return (
    <ol className="border border-slate-200 bg-white divide-y divide-slate-100" aria-label="Booked families">
      {bookings.map((b, i) => (
        <li key={b.id} className="flex items-baseline gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 tabular-nums w-6 shrink-0" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-slate-900 truncate">{b.headOfFamily}</span>
        </li>
      ))}
    </ol>
  );
}
