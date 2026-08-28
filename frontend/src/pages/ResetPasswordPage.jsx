import { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';
import { authApi } from '../services/authApi';
import { swiss, TricolorStrip } from '../components/ui/swiss';
import { Alert } from '../components/ui/alert';

export default function ResetPasswordPage({ token, onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        if (onResetSuccess) onResetSuccess();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Authorization verification failed, token expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-[#000080]">
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img src={heroBackdrop} alt="" className="w-full h-full object-cover opacity-30" />
      </div>

      <div className="relative z-10">
        <TricolorStrip />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md ${swiss.panel} p-8 space-y-5`}>
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={logoAsset} alt="E-Ration Brand Logo" className="w-14 h-14 object-contain bg-slate-50 p-1 rounded-2xl" />
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tighter text-slate-900">Update Credentials</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Set a new security access password</p>
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {success && (
            <Alert variant="success">
              Security credentials updated cleanly!
              <span className="block text-[10px] text-slate-500 mt-0.5">Redirecting to terminal access interface...</span>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="reset-password" className={swiss.label}>New Security Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-400" size={16} />
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${swiss.input} pl-11 pr-10 py-3`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-900 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-confirm" className={swiss.label}>Confirm New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-400" size={16} />
                  <input
                    id="reset-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${swiss.input} pl-11 py-3`}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`${swiss.btnPrimary} w-full py-3.5 mt-2`}>
                {loading ? 'Processing Registry Update...' : 'Commit New Password'}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
            <ShieldCheck size={13} className="text-green-700" />
            <span className={swiss.micro}>Encrypted Password Overwrite Terminal Active</span>
          </div>
        </div>
      </main>

    </div>
  );
}
