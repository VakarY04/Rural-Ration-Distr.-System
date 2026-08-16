import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  Bot,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  X,
  CreditCard,
  Send,
  Loader2,
  ChevronRight,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';

export default function AiSupportPage() {
  const { account } = useAccount();
  const [cardId, setCardId] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  useEffect(() => {
    // Attempt to load card ID from profile if available
    const token = localStorage.getItem('ration_user_token');
    if (account?.rationCardNumber) {
      setCardId(account.rationCardNumber);
    } else if (token) {
      fetch('http://localhost:5000/api/family/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.rationCardNumber) {
            setCardId(data.rationCardNumber);
          }
        })
        .catch(() => {});
    }
  }, [account]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const token = localStorage.getItem('ration_user_token');
      const res = await fetch('http://localhost:5000/api/ai/grievance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ issue })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to communicate with AI server.');
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to communicate with the Gemini AI bridge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Main AI Help Desk Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100/80 shrink-0">
              <Sparkles size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Help Desk</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Submit questions or report issues in your local language.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-2xl text-xs font-bold w-fit shrink-0">
            <CreditCard size={15} className="text-emerald-700" />
            <span>Card ID: {cardId || '122341'}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle size={17} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={17} className="text-purple-600" />
              <h2 className="text-sm font-black text-slate-800 tracking-tight">
                Describe your issue or log your complaint
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Type your question or describe the issue you are facing with ration services.
            </p>

            <div className="relative mt-2">
              <textarea
                rows={5}
                maxLength={1000}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Dukandar ne chawala kam diye hai..."
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-purple-500 rounded-2xl p-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              />
              <div className="absolute right-4 bottom-3 text-[11px] font-semibold text-slate-400 select-none">
                {issue.length} / 1000
              </div>
            </div>
          </div>

          {/* Multilingual Info Strip */}
          <div className="bg-purple-50/80 text-purple-900 border border-purple-100 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full border border-purple-400 text-purple-700 flex items-center justify-center shrink-0 text-[11px] font-bold">
              i
            </div>
            <span>You can type in any local language. Our AI will understand and assist you.</span>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading || !issue.trim()}
            className={`w-full bg-[#9333ea] hover:bg-[#7e22ce] text-white text-xs font-bold py-4 rounded-2xl transition duration-200 shadow-lg shadow-purple-500/25 uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.99] ${
              loading || !issue.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing Issue via Gemini AI Bridge...</span>
              </>
            ) : (
              <>
                <Bot size={16} />
                <span>ANALYZE ISSUE VIA GEMINI AI BRIDGE</span>
              </>
            )}
          </button>
        </form>

        {/* AI Analysis Result Display */}
        {analysis && (
          <div className="bg-purple-50/50 border border-purple-200/90 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
                <CheckCircle2 size={16} className="text-purple-600" />
                <span>AI Grievance Analysis & Official Ticket Generated</span>
              </div>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Resolution
              </span>
            </div>

            {analysis.response ? (
              <div className="bg-white/80 border border-purple-100 rounded-xl p-4 text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                {analysis.response}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                  <p className="font-bold text-slate-800 mt-0.5">{analysis.category || 'Allocation Check'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Summary</p>
                  <p className="font-bold text-slate-800 mt-0.5">{analysis.summary || 'Logged in PDS Registry'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Action Status</p>
                  <p className="font-bold text-emerald-700 mt-0.5">{analysis.action || 'Assigned to FPS Inspector'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Help Desk Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full border-2 border-purple-400 text-purple-600 flex items-center justify-center shrink-0">
            <HelpCircle size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Still need help?</h3>
            <p className="text-xs text-slate-500 font-medium">
              If your issue is urgent or not resolved, you can visit your nearest FPS or contact the helpline.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHelplineModal(true)}
          className="flex items-center gap-2 border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-purple-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none shadow-2xs"
        >
          <PhoneCall size={14} className="text-purple-600" />
          <span>View Helpline</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Helpline Contact Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <h4 className="text-base font-black text-slate-900">National & State PDS Helplines</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHelplineModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-1">
                <p className="text-[10px] uppercase font-bold text-purple-700">Toll-Free National Grievance Number</p>
                <p className="text-lg font-black text-slate-900">1967 / 1800-180-2087</p>
                <p className="text-[11px] text-slate-500">Operates 24x7 in all scheduled national languages.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500">FPS Consumer Affairs Directorate</p>
                <p className="text-sm font-bold text-slate-800">1800-425-9393</p>
                <p className="text-[11px] text-slate-500">Direct escalations for depot supply irregularities.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelplineModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase cursor-pointer"
            >
              Close Helpline Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}