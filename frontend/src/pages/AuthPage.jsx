import React from 'react';
import { ShieldCheck, Mail, Smartphone, ArrowLeft } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';

export default function AuthPage({ onNavigate }) {
  return (
    <div className="relative min-h-screen font-sans flex items-center justify-center p-6 text-white overflow-hidden bg-slate-950">
      
      {/* Top-Left Back to Home Button */}
      <button 
        type="button"
        onClick={() => onNavigate && onNavigate('landing')}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-xs font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-white/20 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-105"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <video autoPlay loop muted playsInline preload="auto" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none">
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/30 z-10 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md bg-slate-900/70 backdrop-blur-none border border-white/15 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={logoAsset} alt="E-Ration Brand Logo" className="w-14 h-14 object-contain rounded-2xl shadow-lg border border-white/10 bg-slate-900/40 p-1" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Access Terminal</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Choose your preferred authorization channel</p>
          </div>
        </div>

        {/* Selection Options */}
        <div className="space-y-3.5">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('auth-email')}
            className="w-full flex items-center justify-between p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-2xl transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Email & Password</h4>
                <p className="text-[11px] text-slate-300">Authorize using standard credentials</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('auth-phone')}
            className="w-full flex items-center justify-between p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-2xl transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <Smartphone size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Phone Number & OTP</h4>
                <p className="text-[11px] text-slate-300">Authorize via mobile verification code</p>
              </div>
            </div>
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