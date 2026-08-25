import { useState } from 'react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '../../services/api';
import { saveSession } from '../../services/session';

// Accent presets so the same form serves both portal sides.
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

// Reusable email + password login form. Posts to /auth/login with an
// optional `role` portal hint the backend uses to gate access.
export default function AuthEmailForm({ role, accent = 'emerald', onSuccess, onForgotPassword }) {
  const styles = ACCENTS[accent] || ACCENTS.emerald;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim().toLowerCase(), password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid credentials provided.');
      saveSession({ token: data.token, name: data.data?.name, role: data.data?.role });
      onSuccess(data.data);
    } catch (err) {
      setError(err.message || 'Could not reach the authentication server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        type="email"
        required
        placeholder="Registered email address"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className={`w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none transition-all ${styles.field}`}
      />

      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none transition-all ${styles.field}`}
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 text-white text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={15} />
            <span>Sign In Securely</span>
          </>
        )}
      </button>

      {onForgotPassword && (
        <button
          type="button"
          onClick={onForgotPassword}
          className="w-full text-center text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Forgot password?
        </button>
      )}
    </form>
  );
}
