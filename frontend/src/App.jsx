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
import AiSupportPage from './pages/AiSupportPage';

export default function App() {
  // ✅ 1. Check localStorage on initial render to preserve active route
  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem('ration_user_token');

    if (!token) {
      return 'landing';
    }

    // Staff accounts always resume inside the distributor console
    const role = localStorage.getItem('ration_user_role');
    if (role === 'distributor' || role === 'admin') {
      return 'distributor-console';
    }

    // If logged in, restore saved page or default to dashboard
    const savedPage = localStorage.getItem('active_page');
    return savedPage && savedPage !== 'landing' && !savedPage.startsWith('auth')
      ? savedPage
      : 'dashboard';
  });

  // ✅ 2. Preserve active dashboard sub-tab on refresh
  const [currentSubPage, setCurrentSubPage] = useState(() => {
    return localStorage.getItem('active_sub_page') || 'home';
  });

  const [resetToken, setResetToken] = useState('');

  // ✅ 3. Helper function to update page and sync with localStorage
  const handleNavigate = (page) => {
    setCurrentPage(page);
    localStorage.setItem('active_page', page);
  };

  const handleSubPageChange = (subPage) => {
    setCurrentSubPage(subPage);
    localStorage.setItem('active_sub_page', subPage);
  };

  // ✅ 4. Clean logout handler
  const handleLogout = () => {
    ['ration_user_token', 'ration_user_name', 'ration_user_role', 'active_page', 'active_sub_page']
      .forEach((key) => localStorage.removeItem(key));
    handleNavigate('landing');
  };

  // ✅ 5. Role-aware landing after a split-portal login
  const handlePortalAuthSuccess = (user) => {
    handleNavigate(user?.role === 'citizen' ? 'dashboard' : 'distributor-console');
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        Promise.resolve().then(() => {
          setResetToken(token);
          handleNavigate('reset-password');
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
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
        <ForgotPasswordPage onNavigate={handleNavigate} />
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
        <DistributorConsolePage onLogout={handleLogout} />
      )}

      {/* 8. Main Dashboard Application Shell */}
      {currentPage === 'dashboard' && (
        <AccountProvider>
          <DashboardShell
            currentSubPage={currentSubPage}
            onSubPageChange={handleSubPageChange}
            onLogout={handleLogout}
          >
            {currentSubPage === 'home' && <DashboardHome onNavigate={handleSubPageChange} />}
            {currentSubPage === 'profile' && <ProfilePage onAccountDeleted={handleLogout} />}
            {currentSubPage === 'booking' && <BookingPage />}
            {currentSubPage === 'ai-support' && <AiSupportPage />}
          </DashboardShell>
        </AccountProvider>
      )}
    </div>
  );
}