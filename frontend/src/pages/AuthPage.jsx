import React, { useState } from 'react';
import { authService } from '../api';
import { Key, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthPage({ initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      if (mode === 'register') {
        const data = await authService.register(email, password);
        setStatus({ type: 'success', message: 'Account securely provisioned!' });
        setTimeout(() => onAuthSuccess(), 1000);
      } else if (mode === 'login') {
        await authService.login(email, password);
        setStatus({ type: 'success', message: 'Authentication verified.' });
        setTimeout(() => onAuthSuccess(), 1000);
      } else if (mode === 'forgot') {
        const data = await authService.forgotPassword(email);
        setStatus({ type: 'success', message: `Token generated! Demo URL: ${data.demoResetTokenUrl}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.toString() });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-[#1A365D] text-white p-6 text-center">
          <h2 className="text-xl font-bold">National E-Ration Security Gateway</h2>
          <p className="text-xs text-slate-300 mt-1">Identity validation portal for public resource allocations</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Mail size={12} /> Email Address
            </label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="name@domain.com"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Lock size={12} /> Password Security String
              </label>
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••"
              />
            </div>
          )}

          {status.message && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <button type="submit" className="w-full py-2.5 bg-[#1A365D] hover:bg-blue-950 text-white font-bold rounded-xl text-sm transition">
            {mode === 'login' && 'Sign In to Portal'}
            {mode === 'register' && 'Generate Secure Credentials'}
            {mode === 'forgot' && 'Issue Recovery Request'}
          </button>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 text-blue-600 font-medium">
            {mode === 'login' ? (
              <>
                <button type="button" onClick={() => setMode('register')}>Create Account</button>
                <button type="button" onClick={() => setMode('forgot')}>Forgot Password?</button>
              </>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="mx-auto">Return to Sign In Hub</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}