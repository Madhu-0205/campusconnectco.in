'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronUp, X } from 'lucide-react';

interface CoverLetterModalProps {
  gigId: string;
  gigTitle: string;
  onSelect?: (letter: string) => void;
  onClose?: () => void;
}

type Tone = 'professional' | 'casual' | 'enthusiastic';

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: 'professional', label: '🎯 Professional', desc: 'Formal, polished' },
  { value: 'casual', label: '😎 Casual', desc: 'Friendly, relaxed' },
  { value: 'enthusiastic', label: '🔥 Enthusiastic', desc: 'Energetic, passionate' },
];

export function AICoverLetterModal({ gigId, gigTitle, onSelect, onClose }: CoverLetterModalProps) {
  const [tone, setTone] = useState<Tone>('professional');
  const [letter, setLetter] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, tone }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLetter(data.coverLetter);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const improve = async () => {
    if (!feedback.trim()) return;
    setImproving(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'improve', originalLetter: letter, feedback }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLetter(data.coverLetter);
      setFeedback('');
      setShowFeedback(false);
      toast.success('Cover letter improved!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImproving(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#0e0e12] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-lg">AI Cover Letter</h2>
            </div>
            <p className="text-slate-400 truncate max-w-[360px]">for: {gigTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-(--surface-2) hover:bg-white/10 rounded-xl text-slate-400 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="p-6 border-white/10 shrink-0">
          <p className="text-slate-500 font-bold uppercase mb-3">Select Tone</p>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`px-3 py-2.5 rounded-xl border transition-all ${ tone === t.value ? 'border-amber-500/60' : 'border-white/10 bg-(--surface-2) text-slate-400 hover:border-white/20' }`}
              >
                <p className="text-sm font-bold">{t.label}</p>
                <p className="text-xs opacity-70">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Letter Output */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!letter && !loading && (
            <div className="py-12 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Choose your tone and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-4 bg-(--surface-2) rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
              ))}
            </div>
          )}

          {letter && !loading && (
            <div className="space-y-4">
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                className="w-full bg-(--surface-2) border border-white/10 rounded-xl p-4 text-slate-200 min-h-[240px] resize-none focus:outline-none focus:border-amber-500/40 leading-relaxed"
              />

              {/* Feedback section */}
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-slate-500 flex items-center gap-1 hover:text-slate-300 transition-colors"
              >
                {showFeedback ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Improve with feedback
              </button>

              {showFeedback && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Make it shorter, mention my React experience more..."
                    className="w-full bg-(--surface-2) border border-white/10 rounded-xl p-3 text-slate-300 h-20 resize-none focus:outline-none focus:border-white/20"
                  />
                  <button onClick={improve} disabled={!feedback.trim() || improving} className="px-3 py-1 bg-(--accent) rounded-lg text-xs font-bold hover:bg-amber-600 disabled:opacity-50 shrink-0">
                  {improving ? 'Improving...' : '✨ Apply Feedback'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-white/10 shrink-0 flex gap-3">
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-(--accent) hover:bg-amber-600 text-black font-bold rounded-xl disabled:opacity-50 transition-colors flex-1 justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {letter ? 'Regenerate' : 'Generate'}
          </button>

          {letter && (
            <>
              <button
                onClick={copy}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition-colors font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {onSelect && (
                <button
                  onClick={() => { onSelect(letter); onClose?.(); }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-colors"
                >
                  Use This
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
