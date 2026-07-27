import React, { useState } from 'react';
import { authService } from '../api';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage({ token, onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      await authService.resetPassword(token, password);
      setStatus({ type: 'success', message: 'Password updated successfully! Redirecting to sign in hub...' });
      setTimeout(() => {
        onResetSuccess();
      }, 2200);
    } catch (err) {
      setStatus({ type: 'error', message: err });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1A365D] text-white p-6 text-center">
          <h2 className="text-xl font-bold">Credential Recovery Portal</h2>
          <p className="text-xs text-slate-300 mt-1">Establish your new platform access parameters securely</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Lock size={12} /> Type New Password
            </label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Lock size={12} /> Confirm New Password
            </label>
            <input 
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="••••••••"
            />
          </div>

          {status.message && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-emerald-100">
            Confirm Credential Update
          </button>
        </form>
      </div>
    </div>
  );
}