import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MapPin } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import { api } from '../services/api';
import { TRICOLOR_GRADIENT } from '../components/ui/swiss';
import DeliveryRouteMap from '../components/DeliveryRouteMap';
import StatBlocks from '../components/distributor/StatBlocks';
import BookingsTable from '../components/distributor/BookingsTable';
import DeliveryDetailsEditor from '../components/distributor/DeliveryDetailsEditor';
import RationItemsEditor from '../components/distributor/RationItemsEditor';
import DistributorProfileMenu from '../components/distributor/DistributorProfileMenu';
import FamiliesDetailsPage from './FamiliesDetailsPage';
import RationDetailsPage from './RationDetailsPage';
import DistributorProfilePage from './DistributorProfilePage';
import SiteFooter from '../components/SiteFooter';
import SkipLink from '../components/SkipLink';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// Distributor / Admin console — Swiss-grid dashboard showing booking demand
// and the two citizen-facing configurations an admin can edit.
export default function DistributorConsolePage({ currentSubPage = 'home', onNavigate, onLogout }) {
  const storedName = localStorage.getItem('ration_user_name') || 'Distributor';
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

  const name = summary?.name || storedName;
  const role = summary?.role || localStorage.getItem('ration_user_role') || 'Staff';

  // Deduplicate booked families by their unique ration card number so the
  // queue + the "recent" count reflect genuinely distinct households. Families
  // that share a name but have different ration cards stay separate.
  const uniqueBookings = summary?.bookings
    ? (() => {
        const seen = new Set();
        const out = [];
        for (const b of summary.bookings) {
          const key = b.rationCardNumber || b.id;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push(b);
        }
        return out;
      })()
    : [];

  const NAV = [
    { id: 'families-details', label: 'Families Details' },
    { id: 'ration-details', label: 'Ration Details' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen font-sans text-[#000080]">
      <SkipLink />
      {/* Sticky nav — tricolor strip + header stay pinned while scrolling */}
      <div className="sticky top-0 z-40">
        <div
          className="h-1 w-full"
          style={{ background: TRICOLOR_GRADIENT }}
          aria-hidden="true"
        />
        <header className="bg-white border-b border-slate-200">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('distributor-console', { subPage: 'home' })}
              className={`flex items-center gap-3 text-left cursor-pointer rounded ${FOCUS}`}
            >
              <img src={logoAsset} alt="E-Ration" className="w-14 h-14 object-contain p-1 rounded-2xl" />
              <div>
                <p className="text-base font-extrabold tracking-tight leading-tight">Distributor Console</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  E-Ration Staff Portal
                </p>
              </div>
            </button>

            <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
              <nav className="flex items-center gap-1 sm:gap-2" aria-label="Distributor navigation">
                {NAV.map((item) => {
                  const active = currentSubPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate('distributor-console', { subPage: item.id })}
                      aria-current={active ? 'page' : undefined}
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer rounded ${FOCUS} ${
                        active ? 'text-[#000080] bg-slate-100' : 'text-slate-600 hover:text-[#000080]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <DistributorProfileMenu name={name} role={role} onNavigate={onNavigate} onLogout={onLogout} />
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 overscroll-y-contain" id="main-content" tabIndex={-1}>
        <div className="flex items-center justify-end">
          <AccessibilityToolbar />
        </div>
        {loading && (
          <p className="py-16 text-center text-sm font-semibold text-slate-500">Loading console data…</p>
        )}

        {!loading && (error || !summary) && (
          <div className="border border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-bold">Couldn't load the console right now.</p>
            <button
              type="button"
              onClick={() => { setLoading(true); loadSummary().finally(() => setLoading(false)); }}
              className="mt-4 bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {!loading && summary && currentSubPage === 'families-details' && (
          <FamiliesDetailsPage bookings={uniqueBookings} />
        )}

        {!loading && summary && currentSubPage === 'ration-details' && (
          <RationDetailsPage items={summary.items} updatedAt={summary.updatedAt} />
        )}

        {!loading && currentSubPage === 'profile' && (
          <DistributorProfilePage name={name} role={role} />
        )}

        {!loading && summary && (currentSubPage === 'home' || !currentSubPage) && (
          <>
            {/* Masthead — Swiss asymmetric headline block */}
            <section>
              <p className="text-sm font-medium text-slate-500">Namaste, {name}</p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-1">
                Distribution Control
              </h1>
            </section>

            <StatBlocks stats={summary.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
              {/* Delivery route map + booking queue */}
              <div className="space-y-6">
                <section aria-label="Delivery route map" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5"><MapPin size={13} className="text-[#198754]" aria-hidden="true" /> Delivery route</h2>
                  </div>
                  <div className="border border-slate-200 bg-white h-[360px] overflow-hidden isolate" title="Delivery route map — use + / − controls to zoom">
                    <DeliveryRouteMap origin={summary.delivery.from} destination={summary.delivery.to} />
                  </div>
                </section>

                <section aria-label="Booking queue" className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-sm font-bold tracking-tight">
                      Booked families queue
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 tabular-nums">
                      {uniqueBookings.length} recent
                    </span>
                  </div>
                  <BookingsTable bookings={uniqueBookings} />
                </section>
              </div>

              {/* Read-only delivery configuration — remounts on fresh server data */}
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

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
