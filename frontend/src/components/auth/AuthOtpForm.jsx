import { useEffect, useState } from 'react';
import { KeyRound, Loader2, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import { saveSession } from '../../services/session';
import { authApi } from '../../services/authApi';
import { useLanguage } from '../../i18n/LanguageContext';
import { swiss } from '../ui/swiss';
import { getAccentHover } from '../ui/authStyles';
import { Alert } from '../ui/alert';

const RESEND_COOLDOWN_SECONDS = 10;

export default function AuthOtpForm({ role, accent = 'emerald', onSuccess }) {
  const { t } = useLanguage();
  const hoverAccent = getAccentHover(accent);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (isResend) => {
    if (isResend && cooldown > 0) return;
    setError('');
    setInfo('');
    if (!phone || phone.trim().length < 10) {
      setError(t('auth.otp.invalidPhone'));
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone, role);
      setOtpSent(true);
      setInfo(isResend ? t('auth.otp.resent') : t('auth.otp.sent'));
      if (isResend) setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message || 'Could not reach the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.trim().length !== 6) {
      setError(t('auth.otp.incomplete'));
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(phone, otp, role);
      saveSession({ token: data.token, name: data.data?.name, role: data.data?.role });
      onSuccess(data.data);
    } catch (err) {
      setError(err.message || t('auth.otp.invalid'));
      setLoading(false);
    }
  };

  return otpSent ? (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {info && !error && <Alert variant="success">{info}</Alert>}

      <div>
        <label htmlFor={`otp-code-${role}`} className={swiss.label}>
          {t('auth.otp.label')}
        </label>
        <input
          id={`otp-code-${role}`}
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder={t('auth.otp.placeholder')}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className={`${swiss.input} text-center text-lg font-extrabold tracking-[0.5em] placeholder:text-sm placeholder:font-medium placeholder:tracking-normal`}
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
            <span>{t('auth.otp.validating')}</span>
          </>
        ) : (
          <>
            <ShieldCheck size={15} />
            <span>{t('auth.otp.verify')}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => handleSendOtp(true)}
        disabled={cooldown > 0}
        className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 break-words"
      >
        <RefreshCw size={12} />
        <span>{cooldown > 0 ? t('auth.otp.resendIn', { seconds: cooldown }) : t('auth.otp.resend')}</span>
      </button>
    </form>
  ) : (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label htmlFor={`otp-phone-${role}`} className={swiss.label}>
          {t('auth.otp.mobile')}
        </label>
        <input
          id={`otp-phone-${role}`}
          type="tel"
          required
          placeholder={t('auth.otp.mobilePh')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={swiss.input}
        />
      </div>

      <button
        type="submit"
        onClick={() => handleSendOtp(false)}
        disabled={loading}
        className={`w-full ${swiss.btnPrimary} ${hoverAccent} py-3`}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>{t('auth.otp.sending')}</span>
          </>
        ) : (
          <>
            <Smartphone size={15} />
            <span>{t('auth.otp.send')}</span>
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 break-words">
        <KeyRound size={11} />
        <span>{t('auth.otp.hint')}</span>
      </p>
    </form>
  );
}
