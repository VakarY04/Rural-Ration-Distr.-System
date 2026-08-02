import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Users, 
  ClipboardCheck, 
  CalendarCheck, 
  MessageSquareCode,
  ArrowRight
} from 'lucide-react';

// Logo Asset Import
import logoAsset from '../images/E-RATION Logo.png';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="relative min-h-screen font-sans antialiased text-white selection:bg-blue-500/30 overflow-x-hidden bg-slate-950">
      
      {/* 1. FIXED BACKGROUND VIDEO LAYER */}
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

      {/* Subtle tint overlay to guarantee clean text separation */}
      <div className="fixed inset-0 bg-slate-950/20 z-10 pointer-events-none" />

      {/* 2. FIXED POSITION SIGN-IN BUTTON (Stays locked in place during scroll) */}
      <div className="fixed top-5 right-6 z-50">
        <button
          onClick={() => onNavigate('auth-login')}
          type="button"
          className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-950/60 backdrop-blur-md border border-white/20 rounded-xl hover:bg-slate-900/80 hover:border-white/40 transition-all duration-300 shadow-2xl"
        >
          <Users size={14} />
          <span>Sign In To Account</span>
        </button>
      </div>

      {/* 3. MAIN SCROLLABLE WRAPPER */}
      <div className="relative z-20 w-full flex flex-col items-center">
        
        {/* HERO SECTION FRAME */}
        <section className="w-full h-screen min-h-[650px] flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col justify-center space-y-8">
              
              {/* BRAND IDENTIFICATION HEADLINE */}
              <div className="flex items-center gap-4">
                <img 
                  src={logoAsset} 
                  alt="E-Ration Curved Brand Logo" 
                  className="w-16 h-16 object-contain rounded-2xl shadow-2xl border border-white/10 bg-slate-900/50 p-1 backdrop-blur-md"
                />
                <div className="flex flex-col">
                  <h1 className="text-white font-black text-2xl tracking-tight uppercase leading-none filter drop-shadow-md">
                    E-Ration Portal
                  </h1>
                  <span className="text-[11px] text-slate-300 font-extrabold tracking-wider uppercase mt-1.5 filter drop-shadow-sm">
                    Smart Allocation & Allocation Scheduling Engine
                  </span>
                </div>
              </div>

              {/* PRIMARY SLOGAN */}
              <div className="space-y-3">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight filter drop-shadow-xl">
                  Every Grain Counts,<br />
                  Every Family Matters.
                </h2>
                <div className="h-1.5 w-56 rounded-full bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#10B981] mt-5 shadow-sm" />
              </div>

              <p className="text-slate-200 text-sm md:text-base font-medium max-w-2xl leading-relaxed filter drop-shadow">
                Empowering Public Distribution Frameworks with structural clarity, zero-shot 
                algorithmic routing accuracy, and secure processing layers—ensuring essential baseline 
                commodities cross delivery lines transparently and cleanly.
              </p>

              {/* FLOATING TRANSPARENT HERO FEATURE BADGES */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl">
                <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-none px-6 py-4 rounded-2xl border border-white/15 shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#10B981] flex items-center justify-center shrink-0">
                    <ShieldCheck size={26} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-white tracking-wide">Transparent</span>
                    <span className="text-xs text-slate-300 font-medium mt-0.5">End-to-end trace tracking</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-none px-6 py-4 rounded-2xl border border-white/15 shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
                    <Cpu size={26} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-white tracking-wide">Technology Driven</span>
                    <span className="text-xs text-slate-300 font-medium mt-0.5">Smart dynamic matching</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-none px-6 py-4 rounded-2xl border border-white/15 shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-[#3B82F6] flex items-center justify-center shrink-0">
                    <Users size={26} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-white tracking-wide">People First</span>
                    <span className="text-xs text-slate-300 font-medium mt-0.5">Citizen-centric workflows</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DETAILS SECTION (Transparent frosted glass boxes floating cleanly over the live background without heavy black masks) */}
        <section className="w-full py-28 px-6 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full space-y-20">
            
            {/* THREE TRANSPARENT FROSTED GLASS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* Card 1 */}
              <div className="bg-slate-900/40 backdrop-blur-none rounded-2xl shadow-2xl border border-white/15 p-10 flex flex-col justify-between hover:bg-slate-900/60 hover:scale-[1.03] transition-all duration-300 group">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ClipboardCheck size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-white text-xl font-black tracking-tight">Smart Quota Allocations</h3>
                    <div className="h-0.5 w-16 bg-blue-500 mx-auto rounded-full" />
                    <p className="text-slate-200 text-sm font-medium leading-relaxed pt-2">
                      AI-powered allocation engine ensures accurate and fair distribution of ration based on eligibility, priority, and availability.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('auth-login')}
                  type="button" 
                  className="mt-8 flex items-center justify-center gap-1.5 text-sm font-black text-blue-400 hover:text-blue-300 transition-colors mx-auto"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900/40 backdrop-blur-none rounded-2xl shadow-2xl border border-white/15 p-10 flex flex-col justify-between hover:bg-slate-900/60 hover:scale-[1.03] transition-all duration-300 group">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shadow-inner mx-auto group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <CalendarCheck size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-white text-xl font-black tracking-tight">Secure Slot Booking</h3>
                    <div className="h-0.5 w-16 bg-green-500 mx-auto rounded-full" />
                    <p className="text-slate-200 text-sm font-medium leading-relaxed pt-2">
                      Book your ration collection slot online and skip long queues. Choose your preferred time, hassle-free.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('auth-login')}
                  type="button" 
                  className="mt-8 flex items-center justify-center gap-1.5 text-sm font-black text-green-400 hover:text-green-300 transition-colors mx-auto"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900/40 backdrop-blur-none rounded-2xl shadow-2xl border border-white/15 p-10 flex flex-col justify-between hover:bg-slate-900/60 hover:scale-[1.03] transition-all duration-300 group">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner mx-auto group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <MessageSquareCode size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-white text-xl font-black tracking-tight">Multilingual AI Grievance Bridge</h3>
                    <div className="h-0.5 w-16 bg-purple-500 mx-auto rounded-full" />
                    <p className="text-slate-200 text-sm font-medium leading-relaxed pt-2">
                      Report issues or get help in your language. Our AI assistant understands and resolves your concerns, 24/7.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('auth-login')}
                  type="button" 
                  className="mt-8 flex items-center justify-center gap-1.5 text-sm font-black text-purple-400 hover:text-purple-300 transition-colors mx-auto"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>

            {/* LOWER TRUST BAR */}
            <footer className="bg-slate-900/50 backdrop-blur-none rounded-2xl border border-white/15 p-6 shadow-2xl max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
                <p className="text-xs font-black text-white tracking-wide uppercase">
                  Committed to a Hunger-Free India through Transparency, Technology & Trust
                </p>
              </div>
            </footer>

          </div>
        </section>
      </div>

    </div>
  );
}