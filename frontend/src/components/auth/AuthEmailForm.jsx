import { useState } from 'react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '../../services/api';
import { saveSession } from '../../services/session';
import { swiss } from '../ui/swiss';

const ACCENTS = {
  emerald: 'hover:bg-green-700',
  amber: 'hover:bg-orange-600',
};

export default function AuthEmailForm({ role, accent = 'emerald', onSuccess, onForgotPassword }) {
  const hoverAccent = ACCENTS[accent] || ACCENTS.emerald;
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
        <div className="flex items-center gap-2 border border-red-300 bg-red-50 text-red-700 px-3.5 py-2.5 text-[11px] font-semibold">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor={`login-email-${role}`} className={swiss.label}>
          Registered Email
        </label>
        <input
          id={`login-email-${role}`}
          type="email"
          required
          placeholder="citizen@portal.gov.in"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={swiss.input}
        />
      </div>

      <div>
        <label htmlFor={`login-password-${role}`} className={swiss.label}>
          Password
        </label>
        <input
          id={`login-password-${role}`}
          type="password"
          required
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
          className="block mx-auto text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 hover:text-orange-600 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          Forgot password?
        </button>
      )}
    </form>
  );
}
