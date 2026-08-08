import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function PhoneAuthPage({ onAuthSuccess, onNavigate }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 10-Second Resend Cooldown Timer State
  const [cooldown, setCooldown] = useState(0);

  // Timer Effect Countdown
  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Send or Resend OTP Handler
  const handleSendOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();
    
    // Prevent execution if resend button is in cooldown mode
    if (isResend && cooldown > 0) return;

    setError('');
    setSuccess('');

    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setSuccess('OTP verification code generated! Check your VS Code Terminal.');
        
        // Timer ONLY starts if triggered via the Resend OTP button
        if (isResend) {
          setCooldown(10);
        }
      } else {
        setError(data.message || 'Failed to send OTP code.');
      }
    } catch (err) {
      setError('Could not connect to the authentication server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('ration_user_token', data.token);
        localStorage.setItem('ration_user_name', data.data?.name || 'Citizen');
        if (onAuthSuccess) onAuthSuccess();
      } else {
        setError(data.message || 'Invalid or expired OTP verification code.');
      }
    } catch (err) {
      setError('Could not connect to the verification server.');
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
            <h2 className="text-xl font-black uppercase tracking-tight">Phone Authorization</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Secure terminal access via mobile OTP</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-emerald-400">{success}</p>
          </div>
        )}

        <div className="space-y-3.5 text-slate-900">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Registered Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 text-slate-400" size={16} />
              <input 
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210"
                className="w-full bg-white/95 text-xs font-bold pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* 1. Send Verification OTP (Does NOT start timer) */}
          <button 
            type="button" 
            onClick={(e) => handleSendOtp(e, false)} 
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg uppercase tracking-wider cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Send Verification OTP'}
          </button>

          {/* 2. Resend OTP (Starts 10-Second Countdown Timer) */}
          <div className="text-center pt-0.5">
            <button 
              type="button" 
              onClick={(e) => handleSendOtp(e, true)} 
              disabled={loading || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</span>
            </button>
          </div>

          {otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5 pt-2 border-t border-white/10 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Enter Received OTP Code</label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 text-slate-400" size={16} />
                  <input 
                    type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP"
                    className="w-full bg-white/95 text-center text-sm tracking-widest font-extrabold py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl transition duration-200 shadow-lg uppercase tracking-wider cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verifying Code...' : 'Verify OTP & Authorize Access'}
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center border-t border-white/15">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Secure AES Endpoint Encryption Active</span>
        </div>
      </div>
    </div>
  );
}