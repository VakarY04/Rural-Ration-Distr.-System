import { useState } from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import { API_URL } from '../services/api';
import { swiss } from '../components/ui/swiss';

export default function ForgotPasswordPage() {
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [loading, setLoading] = useState(false);

  // Drive the split backdrop hover exactly like the login portal.
  const [activeSide, setActiveSide] = useState(null);
  const activate = (side) => setActiveSide(side);
  const deactivate = () => setActiveSide(null);

  // Hovering the card reveals the backdrop artwork behind it.
  const [cardHovered, setCardHovered] = useState(false);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setForgotError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(true);
      } else {
        setForgotError(data.message || 'Error executing credential delivery loop.');
      }
    } catch (err) {
      setForgotError('Could not connect to account verification server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen font-sans bg-slate-950 text-white overflow-hidden flex flex-col">
      <HoverSplitBackdrop image={heroBackdrop} activeSide={activeSide} reveal={cardHovered} />

      {/* Invisible hover zones that light up each side of the split backdrop. */}
      <div className="absolute inset-0 z-0" onMouseLeave={deactivate} aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-1/2" onMouseEnter={() => activate('left')} />
        <div className="absolute inset-y-0 right-0 w-1/2" onMouseEnter={() => activate('right')} />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
          className={`w-full max-w-md ${swiss.panel} rounded-3xl p-8 space-y-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:border-[#FF9933]`}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={logoAsset} alt="E-Ration Brand Logo" className="w-14 h-14 object-contain bg-slate-50 p-1 rounded-2xl" />
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tighter text-[#000080]">Account Recovery</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Recover registry credentials via email</p>
            </div>
          </div>

          {forgotError && (
            <div className="border border-red-300 bg-red-50 p-3 text-center rounded-2xl">
              <p className="text-xs font-bold text-red-700">{forgotError}</p>
            </div>
          )}

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
            <div className="border border-[#138808] bg-green-50 p-4 text-center space-y-2 rounded-2xl">
              <p className="text-xs font-bold text-[#138808]">Recovery email successfully dispatched!</p>
              <p className="text-[11px] text-slate-500">Please check your email client inbox for authentication credentials.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
            <ShieldCheck size={13} className="text-[#138808]" />
            <span className={swiss.micro}>Secure Account Recovery Active</span>
          </div>
        </div>
      </main>
    </div>
  );
}
