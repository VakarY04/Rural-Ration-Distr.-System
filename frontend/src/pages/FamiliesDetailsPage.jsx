import { swiss } from '../components/ui/swiss';
import BookingsTable from '../components/distributor/BookingsTable';

// Minimal Families Details view — surfaces the unique booked families pulled
// from the shared distributor summary. Full family management is out of scope
// for this navigation step.
export default function FamiliesDetailsPage({ bookings }) {
  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>Distribution records · वितरण अभिलेख</p>
        <h1 className={swiss.headline}>Families Details</h1>
        <p className="text-sm text-slate-500 mt-2">
          Households that have booked ration through the Public Distribution System.
        </p>
      </header>

      <section aria-label="Booked families" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className={swiss.sectionTitle}>Booked families</h2>
          <span className="text-[10px] font-bold tracking-[0.14em] text-slate-400 tabular-nums">
            {bookings.length} recent
          </span>
        </div>
        <BookingsTable bookings={bookings} />
      </section>
    </div>
  );
}
