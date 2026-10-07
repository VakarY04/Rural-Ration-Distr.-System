import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { saveSession } from '../../services/session';
import { authApi } from '../../services/authApi';
import { useLanguage } from '../../i18n/LanguageContext';
import { swiss } from '../ui/swiss';
import { getAccentHover } from '../ui/authStyles';
import { Alert } from '../ui/alert';

export default function AuthEmailForm({ role, accent = 'emerald', onSuccess, onForgotPassword }) {
  const { t } = useLanguage();
  const hoverAccent = getAccentHover(accent);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(identifier, password, role);
      saveSession({ token: data.token, name: data.data?.name, role: data.data?.role });
      onSuccess(data.data);
    } catch (err) {
      setError(err.message || t('auth.email.serverUnreachable'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label htmlFor={`login-email-${role}`} className={swiss.label}>
          {t('auth.email.registeredEmail')}
        </label>
        <input
          id={`login-email-${role}`}
          type="email"
          required
          autoComplete="off"
          placeholder="citizen@portal.gov.in"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={swiss.input}
        />
      </div>

      <div>
        <label htmlFor={`login-password-${role}`} className={swiss.label}>
          {t('auth.email.password')}
        </label>
        <input
          id={`login-password-${role}`}
          type="password"
          required
          autoComplete="off"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={swiss.input}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${swiss.btnPrimary} ${hoverAccent} py-3`}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>{t('auth.email.verifying')}</span>
          </>
        ) : (
          <>
            <ShieldCheck size={15} />
            <span>{t('auth.email.signIn')}</span>
          </>
        )}
      </button>

      {onForgotPassword && (
        <button
          type="button"
          onClick={onForgotPassword}
          className="block mx-auto text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 break-words"
        >
          {t('auth.email.forgot')}
        </button>
      )}
    </form>
  );
}
