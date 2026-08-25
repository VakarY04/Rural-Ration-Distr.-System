import { useEffect, useState } from 'react';
import { KeyRound, Loader2, AlertCircle, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import { API_URL } from '../../services/api';
import { saveSession } from '../../services/session';

// Accent presets shared with AuthEmailForm.
const ACCENTS = {
  emerald: {
    button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25',
    field: 'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20',
  },
  amber: {
    button: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25',
    field: 'focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20',
  },
};

const RESEND_COOLDOWN_SECONDS = 10;

// Reusable phone + OTP login form. Posts to /auth/send-otp and
// /auth/verify-otp with an optional `role` portal hint.
export default function AuthOtpForm({ role, accent = 'emerald', onSuccess }) {
  const styles = ACCENTS[accent] || ACCENTS.emerald;
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const post = async (endpoint, body) => {
    const response = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
  };

  const handleSendOtp = async (isResend) => {
    if (isResend && cooldown > 0) return;
    setError('');
    setInfo('');
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await post('/auth/send-otp', { phone: phone.trim(), role });
      setOtpSent(true);
      setInfo(isResend ? 'A fresh OTP code has been dispatched.' : 'OTP dispatched to your mobile number.');
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
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const data = await post('/auth/verify-otp', { phone: phone.trim(), otp: otp.trim(), role });
      saveSession({ token: data.token, name: data.data?.name, role: data.data?.role });
      onSuccess(data.data);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
      setLoading(false);
    }
  };

  return otpSent ? (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {info && !error && (
        <p className="text-[11px] font-semibold text-emerald-300 text-center">{info}</p>
      )}

      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        required
        placeholder="6-digit OTP code"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className={`w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-center text-lg font-black tracking-[0.5em] text-white placeholder:text-sm placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none transition-all ${styles.field}`}
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 text-white text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Validating Code...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={15} />
            <span>Verify & Sign In</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => handleSendOtp(true)}
        disabled={cooldown > 0}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white uppercase tracking-wider cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshCw size={12} />
        <span>{cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend OTP code'}</span>
      </button>
    </form>
  ) : (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        type="tel"
        required
        placeholder="Registered mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={`w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none transition-all ${styles.field}`}
      />

      <button
        type="submit"
        onClick={() => handleSendOtp(false)}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 text-white text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Dispatching OTP...</span>
          </>
        ) : (
          <>
            <Smartphone size={15} />
            <span>Send OTP Code</span>
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <KeyRound size={11} />
        <span>A 6-digit code valid for 5 minutes will be issued</span>
      </p>
    </form>
  );
}
