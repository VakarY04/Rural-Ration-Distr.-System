import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage'; // Selector Hub
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
  const [currentPage, setCurrentPage] = useState('landing');
  const [currentSubPage, setCurrentSubPage] = useState('home');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    // Intercept deep link tokens coming from email accounts
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
        setCurrentPage('reset-password');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* 1. Landing Page */}
      {currentPage === 'landing' && (
        <LandingPage onNavigate={setCurrentPage} />
      )}
      
      {/* 2. Selection Hub (Handles legacy 'auth' and 'auth-login' calls safely) */}
      {(currentPage === 'auth-selection' || currentPage === 'auth-login' || currentPage === 'auth') && (
        <AuthPage onNavigate={setCurrentPage} />
      )}

      {/* 3. Dedicated Email Authentication Page */}
      {currentPage === 'auth-email' && (
        <EmailAuthPage 
          onAuthSuccess={() => setCurrentPage('dashboard')} 
          onNavigate={setCurrentPage} 
        />
      )}

      {/* 4. Dedicated Phone OTP Authentication Page */}
      {currentPage === 'auth-phone' && (
        <PhoneAuthPage 
          onAuthSuccess={() => setCurrentPage('dashboard')} 
          onNavigate={setCurrentPage} 
        />
      )}

      {/* 5. Registration Page */}
      {currentPage === 'auth-register' && (
        <RegisterPage onNavigate={setCurrentPage} />
      )}

      {/* 6. Password Recovery Requests */}
      {currentPage === 'auth-forgot' && (
        <ForgotPasswordPage onNavigate={setCurrentPage} />
      )}

      {/* 7. Password Reset Verification Form */}
      {currentPage === 'reset-password' && (
        <ResetPasswordPage 
          token={resetToken} 
          onResetSuccess={() => setCurrentPage('auth-email')} 
        />
      )}

      {/* 8. Main Dashboard Application Shell */}
      {currentPage === 'dashboard' && (
        <DashboardShell 
          currentSubPage={currentSubPage} 
          onSubPageChange={setCurrentSubPage} 
          onLogout={() => setCurrentPage('landing')}
        >
          {currentSubPage === 'home' && <DashboardHome onNavigate={setCurrentSubPage} />}
          {currentSubPage === 'profile' && <ProfilePage />}
          {currentSubPage === 'booking' && <BookingPage />}
          {currentSubPage === 'ai-support' && <AiSupportPage />}
        </DashboardShell>
      )}
    </div>
  );
}