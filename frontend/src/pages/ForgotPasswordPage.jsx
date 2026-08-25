import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import { API_URL } from '../services/api';

export default function ForgotPasswordPage({ onNavigate }) {
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setForgotError('');
    setLoading(true);
    
    try {
      const response = await fetch(API_URL + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      
      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(true);
      } else {
        setForgotError(data.message || 'Error executing credential delivery loop.');
      }
    } catch (err) {
      setForgotError('Could not connect to account verification server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans flex items-center justify-center p-6 text-white overflow-hidden bg-slate-950">
      
      <video autoPlay loop muted playsInline preload="auto" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none">
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/30 z-10 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-6">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={logoAsset} alt="E-Ration Brand Logo" className="w-14 h-14 object-contain rounded-2xl bg-slate-900/40 p-1 border border-white/10" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Account Recovery</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Recover registry credentials via email terminal</p>
          </div>
        </div>

        {forgotError && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-red-400">{forgotError}</p>
          </div>
        )}

        {!forgotSuccess ? (
          <form onSubmit={handleSendResetEmail} className="space-y-4 text-slate-900">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Registered Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-400" size={16} />
                <input 
                  type="email" 
                  required 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  placeholder="citizen@workspace.com"
                  className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg uppercase tracking-wider cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Send Password Reset Link'}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2">
            <p className="text-xs font-bold text-emerald-400">Recovery email successfully dispatched!</p>
            <p className="text-[11px] text-slate-300">Please check your email client inbox for authentication credentials.</p>
          </div>
        )}

        <div className="flex items-center justify-center pt-1">
          <button 
            type="button" 
            onClick={() => onNavigate && onNavigate('auth-login')}
            className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Login</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center border-t border-white/15">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Secure Account Recovery Processing Active</span>
        </div>
      </div>
    </div>
  );
}