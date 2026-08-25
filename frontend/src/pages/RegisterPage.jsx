import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';
import { API_URL } from '../services/api';

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          phone: digits,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          onNavigate('admin-login');
        }, 3000);
      } else {
        setError(data.message || 'Error establishing registry footprint.');
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
      
      {/* Top-Left Fixed Back Button */}
      <button 
        type="button"
        onClick={() => onNavigate && onNavigate('admin-login')}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-xs font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-105"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Heavily blurred + dimmed backdrop (~65%) so the form stays the focus */}
      <img src={heroBackdrop} alt="" aria-hidden="true" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none blur-[6px] scale-110" />
      <div className="fixed inset-0 bg-slate-950/65 z-10 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-5">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={logoAsset} alt="E-Ration Logo" className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-white/10 bg-slate-900/40 p-1" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Registration Terminal</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Create a new citizen credential footprint</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1">
            <p className="text-xs font-bold text-emerald-400">Account Created Successfully!</p>
            <p className="text-[11px] text-slate-300">Your footprint has been successfully registered to MongoDB.</p>
            <p className="text-[10px] text-blue-400 font-medium animate-pulse pt-1">Redirecting to authorization hub...</p>
          </div>
        )}

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
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Mobile Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210"
                  maxLength={12}
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

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center border-t border-white/15">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Secure AES Endpoint Encryption Active</span>
        </div>

      </div>
    </div>
  );
}