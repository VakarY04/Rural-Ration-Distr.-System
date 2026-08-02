import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, KeyRound } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // LIVE BACKEND HANDSHAKE: Posts input criteria directly to MongoDB via Express
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          name, 
          email: email.trim().toLowerCase(), 
          password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // FIXED FLOW: Triggers the success banner instead of auto-logging into the dashboard
        setSuccess(true);
        
        // Wipe local form inputs cleanly
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // FIXED FLOW: Holds for 3 seconds so the user reads the notice, then redirects to login terminal
        setTimeout(() => {
          onNavigate('auth-login');
        }, 3000);
      } else {
        setError(data.message || 'Error establishing citizen registry footprint.');
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
      
      {/* BACKGROUND VIDEO LAYER */}
      <video autoPlay loop muted playsInline preload="auto" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none">
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/30 z-10 pointer-events-none" />

      {/* REGISTRATION TERMINAL SHELL */}
      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-5">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={logoAsset} alt="E-Ration Logo" className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-white/10 bg-slate-900/40 p-1" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Registration Terminal</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Create a new citizen credential footprint</p>
          </div>
        </div>

        {/* Dynamic Error Status Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        {/* FIXED: Dynamic Success Confirmation Banner */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1">
            <p className="text-xs font-bold text-emerald-400">Account Created Successfully!</p>
            <p className="text-[11px] text-slate-300">Your footprint has been successfully registered to MongoDB.</p>
            <p className="text-[10px] text-blue-400 font-medium animate-pulse pt-1">Redirecting to login portal...</p>
          </div>
        )}

        {/* Hide Form Fields Upon Success Execution */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-900">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-slate-400" size={16} />
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                  className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Email Address</label>
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

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Confirm Password</label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 text-slate-400" size={16} />
                <input 
                  type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••••"
                  className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg mt-2 uppercase tracking-wider cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing Registry Footprint...' : 'Register Account'}
            </button>
          </form>
        )}

        {!success && (
          <div className="text-center pt-1">
            <button type="button" onClick={() => onNavigate && onNavigate('auth-login')} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer bg-transparent border-none outline-none">
              Already have an active registry? Login here
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center border-t border-white/15">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Secure AES Endpoint Encryption Active</span>
        </div>

      </div>
    </div>
  );
}