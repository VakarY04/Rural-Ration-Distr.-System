import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MapPin, X, AlertCircle } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.webp';
import { api } from '../services/api';
import { TRICOLOR_GRADIENT } from '../components/ui/swiss';
import DeliveryRouteMap from '../components/DeliveryRouteMap';
import StatBlocks from '../components/distributor/StatBlocks';
import ReportsPanel from '../components/distributor/ReportsPanel';
import DistributorProfileMenu from '../components/distributor/DistributorProfileMenu';
import FamilyDetailsDialog from '../components/distributor/FamilyDetailsDialog';
import FamiliesDetailsPage from './FamiliesDetailsPage';
import RationDetailsPage from './RationDetailsPage';
import ComplaintsPage from './ComplaintsPage';
import DistributorProfilePage from './DistributorProfilePage';
import SiteFooter from '../components/SiteFooter';
import SkipLink from '../components/SkipLink';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { useLanguage } from '../i18n/LanguageContext';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

// Distributor / Admin console — Swiss-grid dashboard showing booking demand.
// Ration items + delivery configuration live on the Ration Details page
// (admin-editable); the Home page stays focused on operations.
export default function DistributorConsolePage({ currentSubPage = 'home', onNavigate, onLogout }) {
  const { t } = useLanguage();
  const storedName = localStorage.getItem('ration_user_name') || t('console.fallbackName');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Family "View" dialog — shared by the Families Details page and the Home
  // booking queue, for admins and distributors alike.
  const [familyCard, setFamilyCard] = useState(null);
  const [familyDetails, setFamilyDetails] = useState(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState('');

  const openFamilyDetails = useCallback((booking) => {
    const card = booking?.rationCardNumber;
    if (!card) return;
    setFamilyCard(card);
    setFamilyDetails(null);
    setFamilyError('');
    setFamilyLoading(true);
    api(`/distributor/families/${encodeURIComponent(card)}`)
      .then((data) => setFamilyDetails(data))
      .catch((e) => setFamilyError(e.message || 'Could not load family details.'))
      .finally(() => setFamilyLoading(false));
  }, []);

  const closeFamilyDetails = useCallback(() => {
    setFamilyCard(null);
    setFamilyDetails(null);
    setFamilyError('');
  }, []);

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

  // Collection status flips — distributor-only actions moving the booking
  // between Confirmed and Collected. Admins never get the buttons.
  const [markingId, setMarkingId] = useState('');
  const [actionError, setActionError] = useState('');

  const setCollectionStatus = useCallback((booking, status) => {
    const id = booking?.id;
    if (!id || markingId) return;
    setMarkingId(id);
    setActionError('');
    api(`/distributor/bookings/${id}`, 'PATCH', { status })
      .then(() => loadSummary())
      .then(() => {
        // Keep an open family dialog in sync when its booking just changed.
        if (familyCard && booking?.rationCardNumber === familyCard) {
          return api(`/distributor/families/${encodeURIComponent(familyCard)}`)
            .then((data) => setFamilyDetails(data))
            .catch(() => {});
        }
        return undefined;
      })
      .catch((e) => setActionError(e.message || 'Could not update booking.'))
      .finally(() => setMarkingId(''));
  }, [markingId, loadSummary, familyCard]);

  const name = summary?.name || storedName;
  const rawRole = summary?.role || localStorage.getItem('ration_user_role') || 'distributor';
  const isAdmin = rawRole === 'admin';
  // 7.1 matrix: backend permissions are authoritative; role fallback keeps
  // older cached summaries working until the next refresh.
  const permissions = summary?.permissions;
  const canEditDelivery = permissions?.canEditDelivery ?? isAdmin;
  const canEditItems = permissions?.canEditItems ?? isAdmin;
  const canManageSlots = permissions?.canManageSlots ?? isAdmin;
  const role = isAdmin ? t('console.roleAdmin') : t('console.roleDistributor');

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
    { id: 'families-details', label: t('console.navFamilies') },
    { id: 'ration-details', label: t('console.navRation') },
    { id: 'home', label: t('console.navHome') },
    // Complaints is admin-only — distributors have no complaints UI.
    ...(isAdmin ? [{ id: 'complaints', label: t('console.navComplaints') }] : []),
    { id: 'profile', label: t('console.navProfile') },
  ];
  const isNavActive = (id) =>
    id === 'home' ? currentSubPage === 'home' || !currentSubPage : currentSubPage === id;

  return (
    <div className="min-h-screen font-sans text-black dark:text-slate-100 dark:bg-slate-950 flex flex-col">
      <SkipLink />
      {/* Sticky nav — tricolor strip + header stay pinned while scrolling */}
      <div className="sticky top-0 z-40">
        <div
          className="h-1 w-full"
          style={{ background: TRICOLOR_GRADIENT }}
          aria-hidden="true"
        />
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('distributor-console', { subPage: 'home' })}
              className={`flex items-center gap-3 text-left cursor-pointer rounded ${FOCUS}`}
            >
              <img src={logoAsset} alt="E-Ration" width={56} height={56} decoding="async" className="w-14 h-14 object-contain p-1 rounded-2xl" />
              <div className="min-w-0">
                <p className="text-base font-extrabold tracking-tight leading-tight break-words">{t('console.title')}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 break-words">
                  {t('console.portal')}
                </p>
              </div>
            </button>

            <div className="flex-1 flex items-center justify-center">
              <nav className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap" aria-label={t('console.navLabel')}>
                {NAV.map((item) => {
                  const active = isNavActive(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate('distributor-console', { subPage: item.id })}
                      aria-current={active ? 'page' : undefined}
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer rounded ${FOCUS} ${
                        active ? 'text-black dark:text-slate-100 bg-slate-100 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
              <DistributorProfileMenu name={name} role={role} avatar={summary?.avatar} onNavigate={onNavigate} onLogout={onLogout} />
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-8 overscroll-y-contain" id="main-content" tabIndex={-1}>
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <AccessibilityToolbar />
        </div>
        {actionError && (
          <div role="alert" className="flex items-start gap-2 text-sm font-medium text-[#DC3545] dark:text-red-400 bg-[#DC3545]/10 border border-[#DC3545]/30 p-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError('')}
              aria-label={t('queue.dismiss')}
              className={`shrink-0 p-1 hover:bg-[#DC3545]/10 transition-colors cursor-pointer ${FOCUS}`}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
        {loading && (
          <p className="py-16 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
        )}

        {!loading && (error || !summary) && (
          <div className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-10 text-center">
            <p className="text-sm font-bold">{t('common.loadFailed')}</p>
            <button
              type="button"
              onClick={() => { setLoading(true); loadSummary().finally(() => setLoading(false)); }}
              className="mt-4 bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={13} aria-hidden="true" />
              {t('common.retry')}
            </button>
          </div>
        )}

        {!loading && summary && currentSubPage === 'families-details' && (
          <FamiliesDetailsPage
            bookings={uniqueBookings}
            onView={openFamilyDetails}
            canMarkCollected={!isAdmin}
            markingId={markingId}
            onMarkCollected={(b) => setCollectionStatus(b, 'Collected')}
            onUnmarkCollected={(b) => setCollectionStatus(b, 'Confirmed')}
          />
        )}

        {!loading && summary && currentSubPage === 'ration-details' && (
          <RationDetailsPage
            items={summary.items}
            delivery={summary.delivery}
            slots={summary.slots}
            distributionDate={summary.distributionDate || ''}
            updatedAt={summary.updatedAt}
            canEditItems={canEditItems}
            canEditDelivery={canEditDelivery}
            canManageSlots={canManageSlots}
            committedItems={summary.stats?.committedItems || []}
            canEditCommitted={canEditItems}
            committedCustomized={summary.stats?.committedCustomized || false}
            onSaved={loadSummary}
          />
        )}

        {!loading && summary && currentSubPage === 'complaints' && isAdmin && (
          <ComplaintsPage />
        )}

        {!loading && currentSubPage === 'profile' && (
          <DistributorProfilePage
            name={name}
            role={role}
            isAdmin={isAdmin}
            summary={summary}
            onSaved={loadSummary}
          />
        )}

        {!loading && summary && (currentSubPage === 'home' || !currentSubPage) && (
          <>
            {/* Masthead — Swiss asymmetric headline block */}
            <section>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 break-words">{t('console.greeting', { name })}</p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-1 break-words min-w-0">
                {t('console.heading')}
              </h1>
              <p className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
                <span className={`px-2.5 py-1 rounded-full border ${isAdmin ? 'border-black/30 bg-black/5 text-black dark:text-slate-100' : 'border-[#198754]/30 bg-[#198754]/10 text-[#198754] dark:text-emerald-400'}`}>
                  {role}
                </span>
              </p>
            </section>

            <StatBlocks stats={summary.stats} />

            {/* Delivery route map (full width — slot windows now live on the
                Ration Details page) */}
            <section aria-label={t('console.mapLabel')} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5 break-words min-w-0"><MapPin size={13} className="text-[#198754] dark:text-emerald-400" aria-hidden="true" /> {t('console.routeTitle')}</h2>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-[360px] overflow-hidden isolate" title={t('console.mapTitle')}>
                <DeliveryRouteMap origin={summary.delivery.from} destination={summary.delivery.to} />
              </div>
            </section>

            {/* Booked families live on the Families Details page only — the
                Home page stays focused on the route map and reports. The
                family "View" dialog below is shared by that page. */}

            {/* 7.4 — entitlement vs allocation vs collection per district */}
            <ReportsPanel />
          </>
        )}

        {familyCard && (
          <FamilyDetailsDialog
            details={familyDetails}
            loading={familyLoading}
            error={familyError}
            onClose={closeFamilyDetails}
          />
        )}
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
