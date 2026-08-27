import { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Phone, KeyRound } from 'lucide-react';
import logoAsset from '../images/E-RATION Logo.png';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';
import HoverSplitBackdrop from '../components/auth/HoverSplitBackdrop';
import { API_URL } from '../services/api';
import { swiss } from '../components/ui/swiss';

const FIELDS = [
  { id: 'reg-name', label: 'Full Name', type: 'text', icon: User, key: 'name', placeholder: 'John Doe' },
  { id: 'reg-email', label: 'Email Address', type: 'email', icon: Mail, key: 'email', placeholder: 'citizen@workspace.com' },
  { id: 'reg-phone', label: 'Mobile Number', type: 'tel', icon: Phone, key: 'phone', placeholder: '98765 43210', maxLength: 12 },
];

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drive the split backdrop hover exactly like the login portal.
  const [activeSide, setActiveSide] = useState(null);
  const activate = (side) => setActiveSide(side);
  const deactivate = () => setActiveSide(null);

  // Hovering the card reveals the backdrop artwork behind it.
  const [cardHovered, setCardHovered] = useState(false);

  const setters = {
    name: setName,
    email: setEmail,
    phone: setPhone,
    password: setPassword,
    confirmPassword: setConfirmPassword,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          phone: digits,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          onNavigate('admin-login');
        }, 3000);
      } else {
        setError(data.message || 'Error establishing registry footprint.');
      }
    } catch (err) {
      setError('Could not connect to the authentication server.');
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
          className={`w-full max-w-md ${swiss.panel} rounded-3xl p-8 space-y-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#FF9933]/40`}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={logoAsset} alt="E-Ration Logo" className="w-14 h-14 object-contain bg-slate-50 p-1 rounded-2xl" />
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tighter text-[#000080]">Registration Terminal</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Create a new citizen credential</p>
            </div>
          </div>

          {error && (
            <div className="border border-red-300 bg-red-50 p-3 text-center">
              <p className="text-xs font-bold text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="border border-[#138808] bg-green-50 p-4 text-center space-y-1">
              <p className="text-xs font-bold text-[#138808]">Account Created Successfully!</p>
              <p className="text-[11px] text-slate-500">Your credential has been registered.</p>
              <p className="text-[10px] text-[#000080] font-medium animate-pulse pt-1">Redirecting to login...</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {FIELDS.map(({ id, label, type, icon: Icon, key, placeholder, maxLength }) => (
                <div key={id}>
                  <label htmlFor={id} className={swiss.label}>{label}</label>
                  <div className="relative flex items-center">
                    <Icon className="absolute left-3.5 text-slate-400" size={16} />
                    <input
                      id={id}
                      type={type}
                      required
                      value={{ name, email, phone }[key]}
                      onChange={(e) => setters[key](e.target.value)}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      className={`${swiss.input} pl-11 py-3`}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label htmlFor="reg-password" className={swiss.label}>Security Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-400" size={16} />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${swiss.input} pl-11 py-3`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className={swiss.label}>Confirm Password</label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 text-slate-400" size={16} />
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${swiss.input} pl-11 py-3`}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`${swiss.btnPrimary} w-full py-3.5 mt-2`}>
                {loading ? 'Processing...' : 'Register Account'}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
            <ShieldCheck size={13} className="text-[#138808]" />
            <span className={swiss.micro}>Secure Endpoint Active</span>
          </div>
        </div>
      </main>
    </div>
  );
}
