import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function EmailAuthPage({ onAuthSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('ration_user_token', data.token);
        localStorage.setItem('ration_user_name', data.data?.name || 'Citizen');
        if (onAuthSuccess) onAuthSuccess();
      } else {
        setError(data.message || 'Invalid email or password credentials.');
      }
    } catch (err) {
      setError('Could not connect to the authentication server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans flex items-center justify-center p-6 text-white overflow-hidden bg-slate-950">
      
      {/* Top-Left Back Button */}
      <button 
        type="button"
        onClick={() => onNavigate && onNavigate('auth-selection')}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-xs font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-105"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <video autoPlay loop muted playsInline preload="auto" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none">
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/30 z-10 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-5">
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={logoAsset} alt="E-Ration Brand Logo" className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-white/10 bg-slate-900/40 p-1" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Email Authorization</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Sign in using your registered credentials</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-3.5 text-slate-900">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Registered Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-slate-400" size={16} />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="citizen@workspace.com"
                className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Security Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-slate-400" size={16} />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••"
                className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg mt-2 uppercase tracking-wider cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Login via Email'}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 px-1">
          <button type="button" onClick={() => onNavigate && onNavigate('auth-register')} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer bg-transparent border-none outline-none">
            Create Account
          </button>
          <button type="button" onClick={() => onNavigate && onNavigate('auth-forgot')} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer bg-transparent border-none outline-none">
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