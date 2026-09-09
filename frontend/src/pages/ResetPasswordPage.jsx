import { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';
import { authApi } from '../services/authApi';
import { useLanguage } from '../i18n/LanguageContext';
import { swiss, TricolorStrip } from '../components/ui/swiss';
import { Alert } from '../components/ui/alert';

export default function ResetPasswordPage({ token, onResetSuccess }) {
  const { t, lang } = useLanguage();
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
      setError(t('auth.reset.short'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset.mismatch'));
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
      setError(err.message || t('auth.reset.expired'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans text-[#000080]">
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
              <h2 className="text-xl font-bold tracking-tighter text-slate-900 break-words min-w-0">{t('auth.reset.title')}</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{t('auth.reset.subtitle')}</p>
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {success && (
            <Alert variant="success">
              {t('auth.reset.success')}
              <span className="block text-[10px] text-slate-500 mt-0.5">{t('auth.reset.redirecting')}</span>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="reset-password" className={swiss.label}>{t('auth.reset.newPassword')}</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-500" size={16} />
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
                    title={showPassword ? t('auth.reset.hide') : t('auth.reset.show')}
                    aria-label={showPassword ? t('auth.reset.hide') : t('auth.reset.show')}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-900 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-confirm" className={swiss.label}>{t('auth.reset.confirm')}</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-500" size={16} />
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

              <button type="submit" disabled={loading} className={`${swiss.btnPrimary} w-full py-3.5 mt-2 break-words`}>
                {loading ? t('auth.reset.processing') : t('auth.reset.submit')}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
            <ShieldCheck size={13} className="text-[#198754]" />
            <span className={swiss.micro}>{t('auth.reset.secureNote')}</span>
          </div>
        </div>
      </main>

    </div>
  );
}
