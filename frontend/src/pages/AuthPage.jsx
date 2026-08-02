import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function AuthPage({ onAuthSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('ration_user_token', 'session_active_token_mock');
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div className="relative min-h-screen font-sans flex items-center justify-center p-6 text-white overflow-hidden bg-slate-950">
      
      {/* FIXED BACKGROUND VIDEO LAYER */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>

      {/* Subtle background overlay */}
      <div className="fixed inset-0 bg-slate-950/30 z-10 pointer-events-none" />

      {/* AUTH CARD SHELL - Transparent with zero blur */}
      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-5">
        
        {/* Branding Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img 
            src={logoAsset} 
            alt="E-Ration Brand Logo" 
            className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-white/10 bg-slate-900/40 p-1"
          />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Access Terminal</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Sign in to manage your household distribution registry</p>
          </div>
        </div>

        {/* Input Form Fields Box */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-900">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Registered Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-slate-400" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@workspace.com"
                className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Security Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-slate-400" size={16} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg mt-2 uppercase tracking-wider cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* Navigation Triggers Row */}
        <div className="flex items-center justify-between pt-1 px-1">
          <button 
            type="button" 
            onClick={() => onNavigate && onNavigate('auth-register')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer"
          >
            Create Account
          </button>

          <button 
            type="button" 
            onClick={() => onNavigate && onNavigate('auth-forgot')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center border-t border-white/15">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Secure AES Endpoint Encryption Active</span>
        </div>

      </div>
    </div>
  );
}