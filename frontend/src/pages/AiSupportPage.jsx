import { useState, useEffect, useRef } from 'react';
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
import { useLanguage } from '../i18n/LanguageContext';
import { swiss, SectionHead } from '../components/ui/swiss';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

export default function AiSupportPage() {
  const { t } = useLanguage();
  const { account } = useAccount();
  const [cardId, setCardId] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [ticket, setTicket] = useState('');
  const [mine, setMine] = useState([]);
  const [error, setError] = useState('');
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const closeModalRef = useRef(null);

  // Keyboard support for the helpline dialog: Esc closes it and focus lands
  // on the close button when it opens, so Tab starts inside the dialog.
  useEffect(() => {
    if (!showHelplineModal) return undefined;
    closeModalRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setShowHelplineModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showHelplineModal]);

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
    // 7.3 — citizen's own tracked tickets (status + staff resolution).
    if (token) {
      fetch(API_URL + '/grievances/mine', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data?.grievances)) setMine(data.grievances);
        })
        .catch(() => {});
    }
  }, [account]);

  const refreshMine = async () => {
    const token = localStorage.getItem('ration_user_token');
    if (!token) return;
    try {
      const res = await fetch(API_URL + '/grievances/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.grievances)) setMine(data.grievances);
    } catch {
      // Tracking list is best-effort; filing result above is authoritative.
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    setTicket('');

    try {
      const token = localStorage.getItem('ration_user_token');
      // 7.3 — filing endpoint triages + persists; the result doubles as the
      // analysis display. Falls back to analysis-only when offline-old backend.
      let res = await fetch(API_URL + '/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ issue })
      });
      let data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        res = await fetch(API_URL + '/ai/grievance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ issue })
        });
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.message || t('helpdesk.aiFailed'));
      setAnalysis(data.analysis || data);
      if (data.grievance?.id) {
        setTicket(String(data.grievance.id).slice(-6).toUpperCase());
        setIssue('');
        refreshMine();
      }
    } catch (err) {
      setError(err.message || t('helpdesk.bridgeFailed'));
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
            <p className={`${swiss.micro} mb-1`}>{t('helpdesk.eyebrow')}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {t('helpdesk.title')}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t('helpdesk.sub')}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-md leading-relaxed">
              {t('helpdesk.intro')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white text-slate-900 border border-slate-300 px-3 py-1.5 text-xs font-bold tabular-nums w-fit shrink-0">
            <CreditCard size={15} className="text-orange-600" />
            <span>{t('helpdesk.cardId', { id: cardId || '122341' })}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="bg-[#DC3545]/10 border-l-4 border-[#DC3545] text-[#DC3545] p-4 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle size={17} className="shrink-0 text-[#DC3545]" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <SectionHead title={t('helpdesk.describeTitle')} />
          <p className="-mt-3 text-xs text-slate-500 font-medium">
            {t('helpdesk.describeHint')}
          </p>

          <div className="relative">
            <label htmlFor="issue-input" className="sr-only">{t('helpdesk.describeLabel')}</label>
            <textarea
              id="issue-input"
              rows={5}
              maxLength={1000}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder={t('helpdesk.placeholder')}
              className={`w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white px-4 py-4 pr-20 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-500 placeholder:font-normal resize-none ${FOCUS}`}
            />
            <div className="absolute right-4 bottom-3 text-[11px] font-bold text-slate-500 tabular-nums select-none" aria-hidden="true">
              {issue.length} / 1000
            </div>
          </div>

          {/* Multilingual Info Strip */}
          <div className="border border-[#0D6EFD]/30 bg-[#0D6EFD]/10 px-4 py-3 text-xs font-medium text-slate-800 flex items-center gap-2.5">
            <span aria-hidden="true" className="w-5 h-5 border border-[#0D6EFD] text-[#0D6EFD] flex items-center justify-center shrink-0 text-[11px] font-bold">
              i
            </span>
            <span>{t('helpdesk.langNote')}</span>
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
                <span>{t('helpdesk.analyzing')}</span>
              </>
            ) : (
              <>
                <Bot size={16} />
                <span>{t('helpdesk.analyze')}</span>
              </>
            )}
          </button>
        </form>

        {/* AI Analysis Result Display */}
        {analysis && (
          <div role="status" className="border border-slate-200 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-[0.08em]">
                <CheckCircle2 size={16} className="text-[#198754]" />
                <span>{t('helpdesk.resultTitle')}</span>
              </div>
              <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {t('helpdesk.live')}
              </span>
            </div>

            {ticket && (
              <p className="bg-[#198754]/10 border border-[#198754]/30 text-[#198754] text-xs font-bold px-3 py-2">
                {t('helpdesk.ticketFiled', { ticket })}
              </p>
            )}

            {analysis.response ? (
              <div className="bg-white border border-slate-200 p-4 text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                {analysis.response}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200 text-xs">
                <div className="bg-white p-3">
                  <p className={swiss.micro}>{t('helpdesk.category')}</p>
                  <p className="font-bold text-slate-900 mt-0.5">{analysis.category || t('helpdesk.categoryFallback')}</p>
                </div>
                <div className="bg-white p-3">
                  <p className={swiss.micro}>{t('helpdesk.summary')}</p>
                  <p className="font-bold text-slate-900 mt-0.5">{analysis.summary || t('helpdesk.summaryFallback')}</p>
                </div>
                <div className="bg-white p-3">
                  <p className={swiss.micro}>{t('helpdesk.action')}</p>
                  <p className="font-bold text-[#198754] mt-0.5">{analysis.action || t('helpdesk.actionFallback')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Citizen tracking — own tickets with staff status + resolution */}
        <section className={`${swiss.panel} p-6 space-y-4`}>
          <h2 className="text-sm font-extrabold tracking-tight text-slate-900">{t('helpdesk.trackTitle')}</h2>
          {mine.length === 0 ? (
            <p className="text-xs text-slate-500 font-medium">{t('helpdesk.trackEmpty')}</p>
          ) : (
            <ol className="divide-y divide-slate-100 border border-slate-200">
              {mine.map((g) => (
                <li key={g.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-slate-300 text-slate-600">
                      #{String(g.id).slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-slate-300 text-slate-600">
                      {g.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-slate-300 text-slate-600">
                      {g.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 break-words">{g.issue}</p>
                  {g.assignedTo && (
                    <p className="text-[11px] text-slate-500">{t('helpdesk.assigned', { who: g.assignedTo })}</p>
                  )}
                  {g.resolution && (
                    <p className="text-xs bg-[#198754]/10 border border-[#198754]/30 text-[#198754] font-semibold px-3 py-2 break-words">
                      {t('helpdesk.resolution')}: {g.resolution}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      </section>

      {/* Bottom Help Desk Card */}
      <section className={`${swiss.panel} p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border border-slate-300 bg-slate-50 text-orange-600 flex items-center justify-center shrink-0">
            <HelpCircle size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900">{t('helpdesk.stillNeed')}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('helpdesk.stillBody')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHelplineModal(true)}
          className={`${swiss.btnSecondary} shrink-0 select-none`}
        >
          <PhoneCall size={14} className="text-orange-600" />
          <span>{t('helpdesk.viewHelpline')}</span>
          <ChevronRight size={14} />
        </button>
      </section>

      {/* Helpline Contact Modal */}
      {showHelplineModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('helpdesk.helplines')}
          className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50"
        >
          <div className={`${swiss.panel} max-w-md w-full p-6 space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <h4 className="text-base font-extrabold tracking-tight text-slate-900">{t('helpdesk.helplinesTitle')}</h4>
              </div>
              <button
                type="button"
                ref={closeModalRef}
                onClick={() => setShowHelplineModal(false)}
                title={t('helpdesk.closeDir')}
                aria-label={t('helpdesk.closeDir')}
                className={`text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-1.5 cursor-pointer transition-colors ${FOCUS}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="border border-slate-200 border-l-4 border-l-orange-600 bg-white p-4 space-y-1">
                <p className={swiss.micro}>{t('helpdesk.tollFree')}</p>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 tabular-nums">1967 / 1800-180-2087</p>
                <p className="text-[11px] text-slate-500">{t('helpdesk.tollFreeNote')}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 space-y-1">
                <p className={swiss.micro}>{t('helpdesk.directorate')}</p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">1800-425-9393</p>
                <p className="text-[11px] text-slate-500">{t('helpdesk.directorateNote')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelplineModal(false)}
              className={`w-full ${swiss.btnPrimary} py-3`}
            >
              {t('helpdesk.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
