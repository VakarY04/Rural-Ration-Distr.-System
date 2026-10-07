import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DistributorConsolePage from './pages/DistributorConsolePage';
import DashboardShell from './components/DashboardShell';
import { AccountProvider } from './context/AccountContext';
import DashboardHome from './pages/DashboardHome';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import OverlayScrollbar from './components/OverlayScrollbar';
import AdhdReadingMask from './components/AdhdReadingMask';
import AiSupportPage from './pages/AiSupportPage';
import InfoPage from './pages/info/InfoPage';

// Mirror the app's React-state routes into the History API (instead of pulling
// in a router) so the browser's native Back/Forward buttons work. Every page
// maps to a URL; the visible split Login portal intentionally shares one route.
function pathForPage(page, subPage = 'home') {
  switch (page) {
    case 'admin-login':
    case 'auth':
    case 'auth-selection':
    case 'auth-login':
      return '/login';
    case 'auth-register':
      return '/register';
    case 'auth-forgot':
      return '/forgot';
    case 'reset-password':
      return '/reset-password';
    case 'distributor-console':
      return subPage && subPage !== 'home' ? `/distributor?view=${subPage}` : '/distributor';
    case 'info':
      return subPage && subPage !== 'home' ? `/info?view=${subPage}` : '/info';
    case 'dashboard':
      return subPage && subPage !== 'home' ? `/dashboard?view=${subPage}` : '/dashboard';
    case 'landing':
    default:
      return '/';
  }
}

// Read the current URL back into a page + sub-page (+ reset token when present).
function parseLocation() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  if (path === '/' || path === '') return { page: 'landing', subPage: 'home' };
  if (path === '/login') return { page: 'admin-login', subPage: 'home' };
  if (path === '/register') return { page: 'auth-register', subPage: 'home' };
  if (path === '/forgot') return { page: 'auth-forgot', subPage: 'home' };
  if (path.startsWith('/reset-password')) {
    const token = path.split('/reset-password/')[1] || params.get('token') || '';
    return { page: 'reset-password', subPage: 'home', token };
  }
  if (path === '/distributor') return { page: 'distributor-console', subPage: params.get('view') || 'home' };
  if (path === '/info') return { page: 'info', subPage: params.get('view') || 'help' };
  if (path === '/dashboard') return { page: 'dashboard', subPage: params.get('view') || 'home' };
  return null;
}

export default function App() {
  // A known deep link (anything but the root) wins, so shared links such as the
  // password-reset URL work. At the root we keep the existing localStorage-based
  // resume so a returning, logged-in user is still taken back into the app.
  const urlParsed = parseLocation();
  const isRoot = window.location.pathname === '/' || window.location.pathname === '';
  const fromUrl = urlParsed && !isRoot;

  const [currentPage, setCurrentPage] = useState(() => {
    if (fromUrl) return urlParsed.page;
    const token = localStorage.getItem('ration_user_token');
    if (!token) return 'landing';
    const role = localStorage.getItem('ration_user_role');
    if (role === 'distributor' || role === 'admin') return 'distributor-console';
    const savedPage = localStorage.getItem('active_page');
    return savedPage && savedPage !== 'landing' && !savedPage.startsWith('auth') ? savedPage : 'dashboard';
  });

  const [currentSubPage, setCurrentSubPage] = useState(() => {
    if (fromUrl) return urlParsed.subPage || 'home';
    return localStorage.getItem('active_sub_page') || 'home';
  });

  const [resetToken, setResetToken] = useState(() => (fromUrl ? urlParsed.token || '' : ''));

  // Single navigation entry point. Pushes (or replaces) a real history entry so
  // browser Back/Forward traversal works, while keeping the localStorage
  // persistence used for refreshes.
  const navigate = (page, opts = {}) => {
    const { replace = false, subPage } = opts;
    const nextSub = subPage !== undefined ? subPage : page === 'dashboard' ? currentSubPage : 'home';
    const path = pathForPage(page, nextSub);
    const state = { page, subPage: nextSub };
    if (replace) {
      window.history.replaceState(state, '', path);
    } else {
      window.history.pushState(state, '', path);
    }
    setCurrentPage(page);
    if (subPage !== undefined) setCurrentSubPage(subPage);
    localStorage.setItem('active_page', page);
    if (subPage !== undefined) localStorage.setItem('active_sub_page', subPage);
  };

  // Kept with the original prop signature so no call site has to change.
  const handleNavigate = (page, opts) => navigate(page, opts);

  const handleSubPageChange = (subPage) => {
    if (subPage === currentSubPage) return; // avoid duplicate history entries
    navigate('dashboard', { subPage });
  };

  const handleLogout = () => {
    ['ration_user_token', 'ration_user_name', 'ration_user_role', 'active_page', 'active_sub_page']
      .forEach((key) => localStorage.removeItem(key));
    navigate('landing', { replace: true });
  };

  // After a split-portal login, replace the history entry (genuine auth
  // redirect) so pressing Back doesn't drop the user back onto the login form.
  const handlePortalAuthSuccess = (user) => {
    navigate(user?.role === 'citizen' ? 'dashboard' : 'distributor-console', { replace: true });
  };

  // Browser Back/Forward: reflect the traversed history entry in app state.
  useEffect(() => {
    const onPopState = (e) => {
      const state = e.state;
      if (state && state.page) {
        setCurrentPage(state.page);
        setCurrentSubPage(state.subPage || 'home');
        localStorage.setItem('active_page', state.page);
        if (state.subPage) localStorage.setItem('active_sub_page', state.subPage);
        return;
      }
      // Entry with no state (e.g. the very first load): trust the URL.
      const parsed = parseLocation();
      if (parsed) {
        setCurrentPage(parsed.page);
        setCurrentSubPage(parsed.subPage || 'home');
        if (parsed.token) setResetToken(parsed.token);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // On first mount, sync the current URL + history state so the entry the user
  // is on carries the correct page state. Preserves the reset-password token in
  // the URL when present.
  useEffect(() => {
    const loc = window.location;
    let path = pathForPage(currentPage, currentSubPage);
    if (currentPage === 'reset-password' && loc.pathname.startsWith('/reset-password/')) {
      path = loc.pathname + loc.search;
    }
    window.history.replaceState({ page: currentPage, subPage: currentSubPage }, '', path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <OverlayScrollbar />
      <AdhdReadingMask />
      {/* 1. Landing Page */}
      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}

      {/* 2. Split Citizen / Distributor Login Portal (single auth gateway) */}
      {(currentPage === 'auth-selection' || currentPage === 'auth-login' || currentPage === 'auth') && (
        <AdminLoginPage
          onNavigate={handleNavigate}
          onAuthSuccess={handlePortalAuthSuccess}
        />
      )}

      {/* 3. Registration Page */}
      {currentPage === 'auth-register' && (
        <RegisterPage onNavigate={handleNavigate} />
      )}

      {/* 6. Password Recovery Request */}
      {currentPage === 'auth-forgot' && (
        <ForgotPasswordPage />
      )}

      {/* 7. Password Reset Verification Form */}
      {currentPage === 'reset-password' && (
        <ResetPasswordPage
          token={resetToken}
          onResetSuccess={() => handleNavigate('admin-login')}
        />
      )}

      {/* 7b. Split Citizen / Distributor Login Portal */}
      {currentPage === 'admin-login' && (
        <AdminLoginPage
          onNavigate={handleNavigate}
          onAuthSuccess={handlePortalAuthSuccess}
        />
      )}

      {/* 7c. Distributor / Admin Console (placeholder until staff modules ship) */}
      {currentPage === 'distributor-console' && (
        <DistributorConsolePage
          currentSubPage={currentSubPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {/* 8. Main Dashboard Application Shell */}
      {currentPage === 'dashboard' && (
        <AccountProvider>
          <DashboardShell
            currentSubPage={currentSubPage}
            onSubPageChange={handleSubPageChange}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          >
            {currentSubPage === 'home' && <DashboardHome onNavigate={handleSubPageChange} />}
            {currentSubPage === 'profile' && <ProfilePage onAccountDeleted={handleLogout} />}
            {currentSubPage === 'booking' && <BookingPage />}
            {currentSubPage === 'ai-support' && <AiSupportPage />}
          </DashboardShell>
        </AccountProvider>
      )}
      {/* 9. Public info pages (Help, Feedback, Sitemap, Policies) */}
      {currentPage === 'info' && (
        <InfoPage view={currentSubPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
