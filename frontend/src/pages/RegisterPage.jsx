import { useState } from 'react';
import { Lock, Mail, User, Phone, KeyRound } from 'lucide-react';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { authApi } from '../services/authApi';
import { swiss } from '../components/ui/swiss';
import { Alert } from '../components/ui/alert';

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
      await authApi.register({
        name,
        email: email.trim().toLowerCase(),
        phone: digits,
        password,
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onNavigate('admin-login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error establishing registry footprint.');
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Registration Terminal" subtitle="Create a new citizen credential">
      {error && <Alert variant="error">{error}</Alert>}

      {success && (
        <Alert variant="success">
          Account Created Successfully!
          <span className="block text-[10px] text-[#000080] font-medium animate-pulse pt-1">
            Redirecting to login...
          </span>
        </Alert>
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
    </AuthPageShell>
  );
}
