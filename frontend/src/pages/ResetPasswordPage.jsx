import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function ResetPasswordPage({ token, onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (onResetSuccess) onResetSuccess();
        }, 2500);
      } else {
        setError(data.message || 'Authorization verification failed, token expired.');
      }
    } catch (err) {
      setError('Could not establish connection to security verification server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      {/* CARD SHELL - Transparent with zero blur */}
      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-5">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img 
            src={logoAsset} 
            alt="E-Ration Brand Logo" 
            className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-white/10 bg-slate-900/40 p-1"
          />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Update Credentials</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Establish a new security access password for your registry</p>
          </div>
        </div>

        {/* Dynamic Alert Status Banners */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-emerald-400">Security credentials updated cleanly!</p>
            <p className="text-[10px] text-slate-300 mt-0.5">Redirecting to terminal access interface...</p>
          </div>
        )}

        {/* Password Reset Form Fields */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-900">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">New Security Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-400" size={16} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/95 text-xs font-bold pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Confirm New Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-400" size={16} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg mt-2 uppercase tracking-wider cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing Registry Update...' : 'Commit New Password'}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center border-t border-white/15">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Encrypted Password Overwrite Terminal Active</span>
        </div>

      </div>
    </div>
  );
}