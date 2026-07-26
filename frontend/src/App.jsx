import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CitizenDashboard from './pages/CitizenDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'auth-login', 'auth-register', 'dashboard'
  const [authenticatedFamilyId, setAuthenticatedFamilyId] = useState('');

  const handleNavigation = (targetView) => {
    setCurrentPage(targetView);
  };

  const handleAuthenticationSuccess = (assignedFamilyId) => {
    setAuthenticatedFamilyId(assignedFamilyId);
    setCurrentPage('dashboard');
  };

  const handleLogoutSequence = () => {
    setAuthenticatedFamilyId('');
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigation} />
      )}
      
      {(currentPage === 'auth-login' || currentPage === 'auth-register') && (
        <div className="relative">
          {/* Top Back-To-Home Utility Button */}
          <button 
            onClick={() => setCurrentPage('landing')}
            className="absolute top-4 left-4 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            ← Return to Hub
          </button>
          <AuthPage 
            initialMode={currentPage === 'auth-login' ? 'login' : 'register'} 
            onAuthSuccess={handleAuthenticationSuccess} 
          />
        </div>
      )}

      {currentPage === 'dashboard' && (
        <CitizenDashboard 
          familyId={authenticatedFamilyId} 
          onLogout={handleLogoutSequence} 
        />
      )}
    </div>
  );
}