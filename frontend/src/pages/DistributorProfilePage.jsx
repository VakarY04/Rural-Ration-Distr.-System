import { swiss } from '../components/ui/swiss';
import { Avatar } from '../components/ui/avatar';

// Minimal Distributor profile view. Reuses the shared design system; full
// profile editing is out of scope for this navigation step.
export default function DistributorProfilePage({ name, role }) {
  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>Distributor records · वितरण अभिलेख</p>
        <h1 className={swiss.headline}>Staff Profile</h1>
        <p className="text-sm text-slate-500 mt-2">Your distributor console identity and access details.</p>
      </header>

      <section className="border border-slate-200 bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center gap-4 p-6">
          <Avatar src={null} name={name} size={56} />
          <div>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">{name}</p>
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 mt-0.5">
              {role || 'Staff'} · E-Ration Staff Portal
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
