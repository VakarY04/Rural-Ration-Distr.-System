import { useState } from 'react';
import { Mail } from 'lucide-react';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { authApi } from '../services/authApi';
import { swiss } from '../components/ui/swiss';
import { Alert } from '../components/ui/alert';

export default function ForgotPasswordPage() {
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
      setForgotError(err.message || 'Error executing credential delivery loop.');
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Account Recovery" subtitle="Recover registry credentials via email">
      {forgotError && <Alert variant="error">{forgotError}</Alert>}

      {!forgotSuccess ? (
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className={swiss.label}>Registered Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-slate-400" size={16} />
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
          <button type="submit" disabled={loading} className={`${swiss.btnPrimary} w-full py-3.5 rounded-xl`}>
            {loading ? 'Sending...' : 'Send Password Reset Link'}
          </button>
        </form>
      ) : (
        <Alert variant="success">
          Recovery email successfully dispatched!
          <span className="block text-[11px] text-slate-500 mt-0.5">
            Please check your email client inbox for authentication credentials.
          </span>
        </Alert>
      )}
    </AuthPageShell>
  );
}
