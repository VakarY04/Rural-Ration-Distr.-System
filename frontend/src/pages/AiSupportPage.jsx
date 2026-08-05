import React, { useState } from 'react';
import { Sparkles, Bot, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AiSupportPage() {
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const token = localStorage.getItem('ration_user_token');
      const res = await fetch('http://localhost:5000/api/ai/grievance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ issue })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to communicate with AI server.');
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to communicate with the Gemini instance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Multilingual Gemini AI Assistance Portal</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Submit questions or supply issues in your local language.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Describe your issue or log your complaint:</label>
            <textarea
              rows={4}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. Dukandar ne chawala kam diye hai..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !issue.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold py-4 rounded-2xl transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <Bot size={16} />
            <span>{loading ? 'Analyzing with Gemini AI...' : 'Analyze Issue via Gemini AI Bridge'}</span>
          </button>
        </form>

        {analysis && (
          <div className="bg-purple-50/60 border border-purple-200 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>AI Analysis & Action Ticket Generated</span>
            </div>
            {analysis.response ? (
              <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap">{analysis.response}</p>
            ) : (
              <div className="text-xs space-y-1 text-slate-700 font-medium">
                <p><strong>Category:</strong> {analysis.category}</p>
                <p><strong>Summary:</strong> {analysis.summary}</p>
                <p><strong>Action Taken:</strong> {analysis.action}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}