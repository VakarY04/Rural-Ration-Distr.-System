import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ResetPasswordPage';
import DashboardShell from './components/DashboardShell';
import DashboardHome from './pages/DashboardHome';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import AiSupportPage from './pages/AiSupportPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { citizenService } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [currentSubPage, setCurrentSubPage] = useState('home');
  const [resetToken, setResetToken] = useState('');

  const [profile, setProfile] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // 1. Catch incoming password reset tokens from email deep links
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
        setCurrentPage('reset-password');
        return;
      }
    }

    // 2. Persistent token session check
    const savedToken = localStorage.getItem('ration_user_token');
    if (savedToken) {
      setCurrentPage('dashboard');
      syncCoreUserRecords();
    }
  }, [currentPage]);

  const syncCoreUserRecords = async () => {
    try {
      const profileRes = await citizenService.getProfile();
      if (profileRes.data) setProfile(profileRes.data);

      const bookingRes = await citizenService.getActiveBooking();
      if (bookingRes.data) setBooking(bookingRes.data);
    } catch (err) {
      console.log('Synchronization completed cleanly.');
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
    setCurrentSubPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('ration_user_token');
    setProfile(null);
    setBooking(null);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      
      {/* LANDING CORE ROUTE */}
      {currentPage === 'landing' && (
        <LandingPage onNavigate={setCurrentPage} />
      )}

      {/* LOGIN TERMINAL ROUTE */}
      {currentPage === 'auth-login' && (
        <div className="relative">
          <button
            onClick={() => setCurrentPage('landing')}
            className="absolute top-4 left-4 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shadow-sm z-50 cursor-pointer"
          >
            &larr; Return to Hub
          </button>
          <AuthPage onAuthSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />
        </div>
      )}

      {/* DEDICATED REGISTRATION ROUTE */}
      {currentPage === 'auth-register' && (
        <div className="relative">
          <button
            onClick={() => setCurrentPage('auth-login')}
            className="absolute top-4 left-4 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shadow-sm z-50 cursor-pointer"
          >
            &larr; Back to Login
          </button>
          <RegisterPage onAuthSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />
        </div>
      )}

      {/* DEDICATED ACCOUNT RECOVERY ROUTE */}
      {currentPage === 'auth-forgot' && (
        <ForgotPasswordPage onNavigate={setCurrentPage} />
      )}

      {/* PASSWORD RESET INTERCEPT ROUTE */}
      {currentPage === 'reset-password' && (
        <ResetPasswordPage
          token={resetToken}
          onResetSuccess={() => {
            window.history.pushState({}, document.title, "/");
            setCurrentPage('auth-login');
          }}
        />
      )}

      {/* CONTROL DASHBOARD WORKSPACE */}
      {currentPage === 'dashboard' && (
        <DashboardShell currentSubPage={currentSubPage} onSubPageChange={setCurrentSubPage} onLogout={handleLogout}>
          {currentSubPage === 'home' && <DashboardHome profile={profile} booking={booking} onNavigate={setCurrentSubPage} />}
          {currentSubPage === 'profile' && <ProfilePage initialProfile={profile} onProfileUpdate={setProfile} />}
          {currentSubPage === 'booking' && <BookingPage activeBooking={booking} profile={profile} onBookingSuccess={setBooking} />}
          {currentSubPage === 'ai-support' && <AiSupportPage />}
        </DashboardShell>
      )}
    </div>
  );
}