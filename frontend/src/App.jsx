import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardShell from './components/DashboardShell';
import DashboardHome from './pages/DashboardHome';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; // IMPORT NEW PAGE
import { citizenService } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); 
  const [currentSubPage, setCurrentSubPage] = useState('home'); 
  const [resetToken, setResetToken] = useState(''); // TRACK RESET PARAMETERS
  
  const [profile, setProfile] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // 1. Analyze browser URL parameters to catch incoming password reset actions
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
        setCurrentPage('reset-password');
        return; // Halt regular session checks
      }
    }

    // 2. Regular persistent session monitoring
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
      console.log('Sync sequence completed.');
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
    setCurrentSubPage('home');
  };

  const handleLogout = () => {
    setProfile(null);
    setBooking(null);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {currentPage === 'landing' && (
        <LandingPage onNavigate={setCurrentPage} />
      )}
      
      {(currentPage === 'auth-login' || currentPage === 'auth-register') && (
        <div className="relative">
          <button 
            onClick={() => setCurrentPage('landing')}
            className="absolute top-4 left-4 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shadow-sm z-50"
          >
            ← Return to Hub
          </button>
          <AuthPage 
            initialMode={currentPage === 'auth-login' ? 'login' : 'register'} 
            onAuthSuccess={handleAuthSuccess} 
          />
        </div>
      )}

      {currentPage === 'reset-password' && (
        <ResetPasswordPage 
          token={resetToken} 
          onResetSuccess={() => {
            // Clean out reset path token parameters to prevent back-button loops
            window.history.pushState({}, document.title, "/");
            setCurrentPage('auth-login');
          }} 
        />
      )}

      {currentPage === 'dashboard' && (
        <DashboardShell 
          currentSubPage={currentSubPage} 
          onSubPageChange={setCurrentSubPage} 
          onLogout={handleLogout}
        >
          {currentSubPage === 'home' && (
            <DashboardHome profile={profile} booking={booking} onNavigate={setCurrentSubPage} />
          )}
          {currentSubPage === 'profile' && (
            <ProfilePage initialProfile={profile} onProfileUpdate={setProfile} />
          )}
          {currentSubPage === 'booking' && (
            <BookingPage activeBooking={booking} profile={profile} onBookingSuccess={setBooking} />
          )}
        </DashboardShell>
      )}
    </div>
  );
}