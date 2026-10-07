import { useState } from 'react';
import { Mail } from 'lucide-react';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { authApi } from '../services/authApi';
import { useLanguage } from '../i18n/LanguageContext';
import { swiss } from '../components/ui/swiss';
import { Alert } from '../components/ui/alert';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setForgotError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.message || t('auth.forgot.failed'));
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')}>
      {forgotError && <Alert variant="error">{forgotError}</Alert>}

      {!forgotSuccess ? (
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className={swiss.label}>{t('auth.forgot.email')}</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-slate-500 dark:text-slate-400" size={16} />
              <input
                id="forgot-email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="citizen@workspace.com"
                className={`${swiss.input} pl-11 py-3 rounded-xl`}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className={`${swiss.btnPrimary} w-full py-3.5 rounded-xl break-words`}>
            {loading ? t('auth.forgot.sending') : t('auth.forgot.submit')}
          </button>
        </form>
      ) : (
        <Alert variant="success">
          {t('auth.forgot.success')}
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {t('auth.forgot.checkInbox')}
          </span>
        </Alert>
      )}
    </AuthPageShell>
  );
}
