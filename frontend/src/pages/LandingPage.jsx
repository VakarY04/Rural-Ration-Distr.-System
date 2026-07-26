import React from 'react';
import { ShieldCheck, CalendarCheck, HelpCircle, FileText, Globe } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-slate-800">
      {/* Official Government Top Utility Bar */}
      <div className="bg-[#1A365D] text-white text-xs py-2 px-4 flex justify-between items-center border-b border-blue-900">
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">GOVT OF INDIA</span>
          <span className="text-slate-300">Department of Food & Public Distribution</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-orange-400 transition">Accessibility Options</button>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <Globe size={12} />
            <span>English / हिंदी</span>
          </div>
        </div>
      </div>

      {/* Main Government Branding Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-bold text-slate-400 text-xs text-center">
              EMBLEM PLACEHOLDER
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1A365D] tracking-tight">E-RATION PORTAL</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Smart Allocation & Allocation Scheduling Engine</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate('auth-login')}
              className="px-5 py-2.5 text-sm font-semibold text-[#1A365D] hover:bg-slate-50 border border-slate-300 rounded-xl transition"
            >
              Sign In to Account
            </button>
            <button 
              onClick={() => onNavigate('auth-register')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-100 transition"
            >
              Register New Family
            </button>
          </div>
        </div>
      </header>

      {/* Public Safety Announcement Ticker */}
      <div className="bg-orange-50 border-b border-orange-200 py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs text-orange-800">
          <span className="bg-orange-600 text-white font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wide">Notice</span>
          <marquee className="font-medium">Slot allocations for August 2026 distribution cycles open exactly 14 days prior to delivery dates. Please register your correct mobile references to avoid verification flags.</marquee>
        </div>
      </div>

      {/* Hero Informational Frame */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">Digital India Initiative</span>
        <h2 className="text-4xl font-black text-[#1A365D] mt-4 max-w-3xl mx-auto leading-tight">
          Transparent, Queue-Free Ration Management for Rural Communities
        </h2>
        <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base">
          Secure your family's essential food commodity allocations transparently. Register dependents details, calculate weight metrics instantly, and book custom time blocks to pick up supplies directly without waiting in crowded distribution queues.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={() => onNavigate('auth-register')}
            className="px-8 py-4 bg-[#1A365D] hover:bg-blue-950 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-0.5"
          >
            Get Started (New Registration)
          </button>
        </div>
      </section>

      {/* Core Operational Pillar Cards */}
      <section className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-[#F4F6F9] rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-[#1A365D] mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1A365D]">Encrypted Identities</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Family frameworks and identity parameters are mapped securely under modern data preservation acts, protecting public distribution parameters seamlessly.
            </p>
          </div>

          <div className="p-6 bg-[#F4F6F9] rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1A365D]">Smart Slot Protections</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Automated system caps enforce a strict ceiling of 5-6 family collections per hour window to fully eliminate supply site congestion.
            </p>
          </div>

          <div className="p-6 bg-[#F4F6F9] rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1A365D]">Pre-Packed Logistics</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Distributors receive calculated material lists days in advance, allowing commodities to be measured, packed, and organized cleanly ahead of your arrival.
            </p>
          </div>
        </div>
      </section>

      {/* Regulatory Footer */}
      <footer className="bg-[#112233] text-slate-400 text-xs py-8 px-6 text-center border-t border-slate-800">
        <p>© 2026 Department of Food and Public Distribution. Designed in accordance with National Portal Guidelines.</p>
        <p className="mt-2 text-slate-500">For academic deployment tracking operations during institutional evaluation milestones.</p>
      </footer>
    </div>
  );
}