import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // FIXED: Make sure this is imported!
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
      {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
      
      {currentPage === 'auth-login' && (
        <AuthPage onAuthSuccess={() => setCurrentPage('dashboard')} onNavigate={setCurrentPage} />
      )}

      {currentPage === 'auth-register' && (
        <RegisterPage onAuthSuccess={() => setCurrentPage('dashboard')} onNavigate={setCurrentPage} />
      )}

      {/* FIXED ROUTING: Connects to the email sending engine page */}
      {currentPage === 'auth-forgot' && (
        <ForgotPasswordPage onNavigate={setCurrentPage} />
      )}

      {/* FIXED ROUTING: Connects to the password input modification form */}
      {currentPage === 'reset-password' && (
        <ResetPasswordPage token={resetToken} onResetSuccess={() => setCurrentPage('auth-login')} />
      )}

      {currentPage === 'dashboard' && (
        <DashboardShell currentSubPage={currentSubPage} onSubPageChange={setCurrentSubPage} onLogout={() => setCurrentPage('landing')}>
          {currentSubPage === 'home' && <DashboardHome onNavigate={setCurrentSubPage} />}
          {currentSubPage === 'profile' && <ProfilePage />}
          {currentSubPage === 'booking' && <BookingPage />}
          {currentSubPage === 'ai-support' && <AiSupportPage />}
        </DashboardShell>
      )}
    </div>
  );
}