import { Wheat, Scale } from 'lucide-react';
import { swiss, SectionHead } from '../../components/ui/swiss';

export function QuotaPanel({ memberCount, totalQuota }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <SectionHead title="Monthly Quota Allocation" />
        <p className="text-[11px] text-slate-500 font-medium tabular-nums">
          {memberCount} Registered Member{memberCount > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-slate-200 p-4 flex items-center gap-3.5 bg-slate-50">
          <div className="w-10 h-10 bg-white border border-slate-300 text-orange-600 flex items-center justify-center shrink-0">
            <Wheat size={20} />
          </div>
          <div>
            <p className={swiss.micro}>Guaranteed Food Grains</p>
            <p className="text-xl font-extrabold tracking-tight text-slate-900 tabular-nums">{totalQuota} kg</p>
          </div>
        </div>

        <div className="border border-slate-200 p-4 flex items-center gap-3.5 bg-slate-50">
          <div className="w-10 h-10 bg-white border border-slate-300 text-slate-900 flex items-center justify-center shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <p className={swiss.micro}>Household Allocation Rate</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5 tabular-nums">10 kg / member (min 35 kg)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActiveBookingTicket({ bookingDetails, headOfFamily }) {
  return (
    <section className={`${swiss.panel} p-6 space-y-4`}>
      <SectionHead
        title="Active Scheduled Slot"
        right={
          <span className="bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider tabular-nums">
            {bookingDetails.status || 'Confirmed'}
          </span>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200 text-xs">
        <div className="bg-white p-3">
          <p className={swiss.micro}>Date</p>
          <p className="font-bold text-slate-900 mt-0.5 tabular-nums">{bookingDetails.distributionDate}</p>
        </div>
        <div className="bg-white p-3">
          <p className={swiss.micro}>Time Window</p>
          <p className="font-bold text-slate-900 mt-0.5 tabular-nums">{bookingDetails.timeSlot}</p>
        </div>
        <div className="bg-white p-3">
          <p className={swiss.micro}>Cardholder</p>
          <p className="font-bold text-slate-900 mt-0.5">{headOfFamily}</p>
        </div>
      </div>
    </section>
  );
}
