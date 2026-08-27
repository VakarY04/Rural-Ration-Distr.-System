import { useState, useEffect, useCallback } from 'react';
import { LogOut, BadgeCheck } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import { api } from '../services/api';
import DeliveryRouteMap from '../components/DeliveryRouteMap';
import StatBlocks from '../components/distributor/StatBlocks';
import BookingsTable from '../components/distributor/BookingsTable';
import DeliveryDetailsEditor from '../components/distributor/DeliveryDetailsEditor';
import RationItemsEditor from '../components/distributor/RationItemsEditor';

// Distributor / Admin console — Swiss-grid dashboard showing booking demand
// and the two citizen-facing configurations an admin can edit.
export default function DistributorConsolePage({ onLogout }) {
  const name = localStorage.getItem('ration_user_name') || 'Distributor';
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSummary = useCallback(() => {
    return api('/distributor/summary')
      .then((data) => {
        setSummary(data);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    let active = true;
    loadSummary().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [loadSummary]);

  return (
    <div className="min-h-screen font-sans text-[#000080]">
      {/* Sticky nav — tricolor strip + header stay pinned while scrolling */}
      <div className="sticky top-0 z-40">
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }}
          aria-hidden="true"
        />
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoAsset} alt="E-Ration" className="w-11 h-11 object-contain p-1 rounded-2xl" />
              <div>
                <p className="text-sm font-extrabold uppercase tracking-tight leading-tight">Distributor Console</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  E-Ration Staff Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 border border-green-700/30 bg-green-50 text-green-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                <BadgeCheck size={13} />
                Authorized Staff
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 bg-slate-900 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Masthead — Swiss asymmetric headline block */}
        <section>
          <p className="text-sm font-medium text-slate-500">Namaste, {name}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-1">
            Distribution Control
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 max-w-xl">
            Live view of citizen ration demand and the delivery configuration published to every household hub.
          </p>
        </section>

        {loading && (
          <p className="py-16 text-center text-sm font-semibold text-slate-400">Loading console data…</p>
        )}

        {!loading && (error || !summary) && (
          <div className="border border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-bold">Couldn't load the console right now.</p>
            <button
              type="button"
              onClick={() => { setLoading(true); loadSummary().finally(() => setLoading(false)); }}
              className="mt-4 bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && summary && (
          <>
            <StatBlocks stats={summary.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
              {/* Delivery route map + booking queue */}
              <div className="space-y-6">
                <section aria-label="Delivery route map" className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.1em]">Delivery route</h2>
                  </div>
                  <div className="border border-slate-200 bg-white h-[360px] overflow-hidden">
                    <DeliveryRouteMap origin={summary.delivery.from} destination={summary.delivery.to} />
                  </div>
                </section>

                <section aria-label="Booking queue" className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.1em]">
                      Booked families queue
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 tabular-nums">
                      {summary.bookings.length} recent
                    </span>
                  </div>
                  <BookingsTable bookings={summary.bookings} />
                </section>
              </div>

              {/* Admin-editable configuration — remounts on fresh server data */}
              <div className="space-y-6">
                <DeliveryDetailsEditor
                  key={`delivery-${summary.updatedAt || 'init'}`}
                  delivery={summary.delivery}
                  onSaved={loadSummary}
                />
                <RationItemsEditor
                  key={`items-${summary.updatedAt || 'init'}`}
                  items={summary.items}
                  onSaved={loadSummary}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="max-w-7xl mx-auto px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          E-Ration Portal · Distribution Console v1.0 · Public Distribution System
        </p>
      </footer>
    </div>
  );
}
