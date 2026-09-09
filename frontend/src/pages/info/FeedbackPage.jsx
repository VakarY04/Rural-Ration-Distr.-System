import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { swiss } from '../../components/ui/swiss';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import InfoShell from './InfoShell';

export default function FeedbackPage({ onNavigate }) {
  const { t } = useLanguage();
  const CATEGORIES = [
    { value: 'Suggestion', label: t('feedback.cat.suggestion') },
    { value: 'Issue', label: t('feedback.cat.issue') },
    { value: 'Question', label: t('feedback.cat.question') },
    { value: 'Accessibility', label: t('feedback.cat.accessibility') },
    { value: 'Other', label: t('feedback.cat.other') },
  ];
  const loggedIn = Boolean(localStorage.getItem('ration_user_token'));
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setTicket('');
    if (message.trim().length < 10) {
      setError(t('feedback.tooShort'));
      return;
    }
    setSending(true);
    try {
      const data = await api('/feedback', 'POST', { category, message, contact });
      setTicket(String(data.id || '').slice(-6).toUpperCase());
      setMessage('');
      setContact('');
    } catch (err) {
      setError(err.message || t('feedback.failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <InfoShell
      eyebrow={t('feedback.eyebrow')}
      title={t('feedback.title')}
      intro={t('feedback.intro')}
      onNavigate={onNavigate}
    >
      {!loggedIn ? (
        <section className={`${swiss.panel} p-6 text-center space-y-3`}>
          <p className="text-sm text-slate-600 break-words">{t('feedback.signInHint')}</p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('admin-login')}
            className={`${swiss.btnPrimary} mx-auto break-words`}
          >
            {t('feedback.signIn')}
          </button>
        </section>
      ) : ticket ? (
        <div role="status" className="bg-[#198754]/10 border border-[#198754]/30 text-[#198754] p-5 text-sm font-semibold flex items-start gap-2.5 break-words min-w-0">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('feedback.received', { ticket })}</span>
        </div>
      ) : (
        <form onSubmit={submit} className={`${swiss.panel} p-6 space-y-4`}>
          {error && (
            <div role="alert" className="bg-[#DC3545]/10 border border-[#DC3545]/30 text-[#DC3545] p-3.5 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="fb-category" className={swiss.label}>{t('feedback.category')}</label>
            <select id="fb-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${swiss.input} cursor-pointer`}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fb-message" className={swiss.label}>{t('feedback.message')}</label>
            <textarea
              id="fb-message"
              rows={5}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback.messagePh')}
              className={`${swiss.input} resize-none`}
            />
            <p className="text-[11px] text-slate-500 mt-1 tabular-nums" aria-hidden="true">{message.length} / 2000</p>
          </div>
          <div>
            <label htmlFor="fb-contact" className={swiss.label}>{t('feedback.contact')}</label>
            <input
              id="fb-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t('feedback.contactPh')}
              maxLength={120}
              className={swiss.input}
            />
          </div>
          <button type="submit" disabled={sending} className={`${swiss.btnPrimary} w-full py-3.5 break-words`}>
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} aria-hidden="true" />}
            {sending ? t('feedback.sending') : t('feedback.send')}
          </button>
        </form>
      )}
    </InfoShell>
  );
}
