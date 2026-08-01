import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Brain, Globe, CheckCircle } from 'lucide-react';

export default function AiSupportPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAiAnalysis = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('ration_user_token');
      const res = await axios.post(
        'http://localhost:5000/api/ai/grievance',
        { userText: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.analytics);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to communicate with the Gemini instance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-[#1A365D] flex items-center gap-1.5">
          <Sparkles size={18} className="text-purple-600 fill-purple-200 animate-pulse" /> 
          Multilingual Gemini AI Assistance Portal
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit questions or supply issues in your local language. The system translates, categorizes, and tracks tickets automatically.
        </p>
      </div>

      <form onSubmit={handleAiAnalysis} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
            Describe your issue or log your complaint:
          </label>
          <textarea
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 font-medium"
            placeholder="e.g., Dukandar ne iss mahine chawal kam diye hain aur aacha vyavhaar nahi kiya."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition uppercase tracking-wider shadow-md shadow-purple-100 flex items-center justify-center gap-2"
        >
          {loading ? 'Analyzing Language & Parameters...' : 'Analyze Issue via Gemini AI Bridge'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-100 text-xs rounded-xl font-semibold">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4 text-xs animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1"><Globe size={10}/> Detected Origin</span>
              <p className="font-bold text-[#1A365D] mt-1">{result.detectedLanguage}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1"><Brain size={10}/> Classification Tag</span>
              <p className="font-bold text-purple-700 mt-1">{result.classificationTag}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-purple-100 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1"><CheckCircle size={10}/> System Status</span>
              <p className="font-bold text-emerald-700 mt-1">Routed & Logged</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Administrative English Translation</span>
              <p className="text-slate-700 font-medium italic mt-0.5">"{result.translatedEnglish}"</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Automated Native Language Resolution Response</span>
              <p className="text-purple-950 font-bold mt-0.5">"{result.nativeResolutionResponse}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}