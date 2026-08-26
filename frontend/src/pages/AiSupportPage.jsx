import { useState, useEffect } from 'react';
import {
  Bot,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  X,
  CreditCard,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { API_URL } from '../services/api';
import { swiss, SectionHead } from '../components/ui/swiss';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

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
      Promise.resolve().then(() => setCardId(account.rationCardNumber));
    } else if (token) {
      fetch(API_URL + '/family/profile', {
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
      const res = await fetch(API_URL + '/ai/grievance', {
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
      <section className={`${swiss.panel} p-6 md:p-8 space-y-6`}>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className={`${swiss.micro} mb-1`}>Grievance Assistant</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              AI Help Desk
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">AI Help</p>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-md leading-relaxed">
              Submit questions or report issues in your local language.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white text-slate-900 border border-slate-300 px-3 py-1.5 text-xs font-bold tabular-nums w-fit shrink-0">
            <CreditCard size={15} className="text-orange-600" />
            <span>Card ID: {cardId || '122341'}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle size={17} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <SectionHead title="Describe your issue or log your complaint" />
          <p className="-mt-3 text-xs text-slate-500 font-medium">
            Type your question or describe the issue you are facing with ration services.
          </p>

          <div className="relative">
            <label htmlFor="issue-input" className="sr-only">Describe your issue</label>
            <textarea
              id="issue-input"
              rows={5}
              maxLength={1000}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. Dukandar ne chawala kam diye hai..."
              className={`w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white px-4 py-4 pr-20 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal resize-none ${FOCUS}`}
            />
            <div className="absolute right-4 bottom-3 text-[11px] font-bold text-slate-400 tabular-nums select-none" aria-hidden="true">
              {issue.length} / 1000
            </div>
          </div>

          {/* Multilingual Info Strip */}
          <div className="border border-blue-200 bg-blue-50/60 px-4 py-3 text-xs font-medium text-slate-800 flex items-center gap-2.5">
            <span aria-hidden="true" className="w-5 h-5 border border-blue-500 text-blue-700 flex items-center justify-center shrink-0 text-[11px] font-bold">
              i
            </span>
            <span>You can type in any local language. Our AI will understand and assist you.</span>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading || !issue.trim()}
            className={`w-full ${swiss.btnPrimary} py-4 text-xs`}
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
          <div role="status" className="border border-slate-200 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-[0.08em]">
                <CheckCircle2 size={16} className="text-green-700" />
                <span>AI Grievance Analysis & Official Ticket Generated</span>
              </div>
              <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                Live Resolution
              </span>
            </div>

            {analysis.response ? (
              <div className="bg-white border border-slate-200 p-4 text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                {analysis.response}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200 text-xs">
                <div className="bg-white p-3">
                  <p className={swiss.micro}>Category</p>
                  <p className="font-bold text-slate-900 mt-0.5">{analysis.category || 'Allocation Check'}</p>
                </div>
                <div className="bg-white p-3">
                  <p className={swiss.micro}>Summary</p>
                  <p className="font-bold text-slate-900 mt-0.5">{analysis.summary || 'Logged in PDS Registry'}</p>
                </div>
                <div className="bg-white p-3">
                  <p className={swiss.micro}>Action Status</p>
                  <p className="font-bold text-green-700 mt-0.5">{analysis.action || 'Assigned to FPS Inspector'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Bottom Help Desk Card */}
      <section className={`${swiss.panel} p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border border-slate-300 bg-slate-50 text-orange-600 flex items-center justify-center shrink-0">
            <HelpCircle size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900">Still need help?</h3>
            <p className="text-xs text-slate-500 font-medium">
              If your issue is urgent or not resolved, you can visit your nearest FPS or contact the helpline.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHelplineModal(true)}
          className={`${swiss.btnSecondary} shrink-0 select-none`}
        >
          <PhoneCall size={14} className="text-orange-600" />
          <span>View Helpline</span>
          <ChevronRight size={14} />
        </button>
      </section>

      {/* Helpline Contact Modal */}
      {showHelplineModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="National and State PDS Helplines"
          className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50"
        >
          <div className={`${swiss.panel} max-w-md w-full p-6 space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <h4 className="text-base font-extrabold tracking-tight text-slate-900">National & State PDS Helplines</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHelplineModal(false)}
                aria-label="Close helpline directory"
                className={`text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-1.5 cursor-pointer transition-colors ${FOCUS}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="border border-slate-200 border-l-4 border-l-orange-600 bg-white p-4 space-y-1">
                <p className={swiss.micro}>Toll-Free National Grievance Number</p>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 tabular-nums">1967 / 1800-180-2087</p>
                <p className="text-[11px] text-slate-500">Operates 24x7 in all scheduled national languages.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 space-y-1">
                <p className={swiss.micro}>FPS Consumer Affairs Directorate</p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">1800-425-9393</p>
                <p className="text-[11px] text-slate-500">Direct escalations for depot supply irregularities.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelplineModal(false)}
              className={`w-full ${swiss.btnPrimary} py-3`}
            >
              Close Helpline Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
