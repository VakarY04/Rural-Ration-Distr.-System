import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import EmailAuthPage from './pages/EmailAuthPage';
import PhoneAuthPage from './pages/PhoneAuthPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardShell from './components/DashboardShell';
import DashboardHome from './pages/DashboardHome';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import AiSupportPage from './pages/AiSupportPage';

export default function App() {
  // ✅ 1. Check localStorage on initial render to preserve active route
  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem('ration_user_token');
    const savedPage = localStorage.getItem('active_page');

    if (token) {
      // If logged in, restore saved page or default to dashboard
      return savedPage && savedPage !== 'landing' && !savedPage.startsWith('auth')
        ? savedPage
        : 'dashboard';
    }
    return 'landing';
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
    localStorage.removeItem('ration_user_token');
    localStorage.removeItem('active_page');
    localStorage.removeItem('active_sub_page');
    handleNavigate('landing');
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
        handleNavigate('reset-password');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* 1. Landing Page */}
      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}
      
      {/* 2. Selection Hub */}
      {(currentPage === 'auth-selection' || currentPage === 'auth-login' || currentPage === 'auth') && (
        <AuthPage onNavigate={handleNavigate} />
      )}

      {/* 3. Dedicated Email Auth Page */}
      {currentPage === 'auth-email' && (
        <EmailAuthPage 
          onAuthSuccess={() => handleNavigate('dashboard')} 
          onNavigate={handleNavigate} 
        />
      )}

      {/* 4. Dedicated Phone OTP Auth Page */}
      {currentPage === 'auth-phone' && (
        <PhoneAuthPage 
          onAuthSuccess={() => handleNavigate('dashboard')} 
          onNavigate={handleNavigate} 
        />
      )}

      {/* 5. Registration Page */}
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
          onResetSuccess={() => handleNavigate('auth-email')} 
        />
      )}

      {/* 8. Main Dashboard Application Shell */}
      {currentPage === 'dashboard' && (
        <DashboardShell 
          currentSubPage={currentSubPage} 
          onSubPageChange={handleSubPageChange} 
          onLogout={handleLogout}
        >
          {currentSubPage === 'home' && <DashboardHome onNavigate={handleSubPageChange} />}
          {currentSubPage === 'profile' && <ProfilePage />}
          {currentSubPage === 'booking' && <BookingPage />}
          {currentSubPage === 'ai-support' && <AiSupportPage />}
        </DashboardShell>
      )}
    </div>
  );
}