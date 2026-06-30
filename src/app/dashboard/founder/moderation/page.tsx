'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Check, X, Flag, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ModerationEvent {
  id: string;
  event: string;
  data: {
    contentType: string;
    contentId?: string;
    authorId: string;
    action: 'FLAG' | 'REJECT';
    score: number;
    reason?: string;
    categories?: { openai: Record<string, boolean>; custom: string[] };
    snippet: string;
  };
  createdAt: string;
}

export default function ModerationQueuePage() {
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FLAG' | 'REJECT'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/moderation-events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      toast.error('Failed to load moderation events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleAction = async (event: ModerationEvent, action: 'approve' | 'remove') => {
    try {
      if (!event.data.contentId) {
        toast.error('No content ID available for this action');
        return;
      }
      const res = await fetch('/api/admin/moderation-events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsId: event.id,
          contentType: event.data.contentType,
          contentId: event.data.contentId,
          action,
        }),
      });
      if (!res.ok) throw new Error('Action failed');
      toast.success(action === 'approve' ? '✅ Content approved' : '🗑️ Content removed');
      setEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = events.filter(e =>
    filter === 'ALL' || e.data.action === filter
  );

  const stats = {
    total: events.length,
    flags: events.filter(e => e.data.action === 'FLAG').length,
    rejects: events.filter(e => e.data.action === 'REJECT').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <h1 className="text-2xl font-black">Moderation Queue</h1>
          </div>
          <p className="text-slate-500">AI-flagged content requiring admin review</p>
        </div>
        <button
          onClick={fetchEvents}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Flagged', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Soft Flags', value: stats.flags, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Auto-Rejected', value: stats.rejects, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-white/10 rounded-2xl p-4`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'FLAG', 'REJECT'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${ filter === f ? 'bg-white' : 'bg-white/5 text-slate-400 hover:bg-white/10' }`}
          >
            {f === 'ALL' ? 'All' : f === 'FLAG' ? '🚩 Flagged' : '❌ Auto-Rejected'}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse h-24" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-slate-500">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold">Queue is empty</p>
            <p className="text-sm mt-1">No content matching this filter</p>
          </div>
        )}

        {!loading && filtered.map(event => {
          const isExpanded = expandedId === event.id;
          const scorePercent = Math.round(event.data.score * 100);
          const scoreColor = scorePercent >= 70 ? 'text-red-400' : scorePercent >= 40 ? 'text-amber-400' : 'text-emerald-400';

          return (
            <div
              key={event.id}
              className={`bg-[#0e0e12] border rounded-2xl overflow-hidden transition-all ${ event.data.action === 'REJECT' ? 'border-red-500/30' : 'border-amber-500/20' }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`font-black px-2 py-0.5 rounded-md uppercase ${ event.data.action === 'REJECT' ? 'bg-red-500/20' : 'bg-amber-500/20 text-amber-400' }`}>
                        {event.data.action === 'REJECT' ? '❌ Auto-Rejected' : '🚩 Flagged'}
                      </span>
                      <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase">
                        {event.data.contentType}
                      </span>
                      <span className={`text-xs font-black ${scoreColor}`}>
                        Risk: {scorePercent}%
                      </span>
                      <span className="text-slate-600 ml-auto">
                        {new Date(event.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Snippet */}
                    <p className="text-slate-300 line-clamp-2 mb-2 font-mono bg-white/5 rounded-lg px-3 py-2">
                      &ldquo;{event.data.snippet}&rdquo;
                    </p>

                    {/* Reason */}
                    {event.data.reason && (
                      <div className="flex items-start gap-2 text-slate-500">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                        <span>{event.data.reason}</span>
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded && event.data.categories && (
                      <div className="mt-3 p-3 bg-white/5 rounded-xl text-xs space-y-2">
                        <p className="font-bold text-slate-400">OpenAI Categories:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(event.data.categories.openai)
                            .filter(([, v]) => v)
                            .map(([k]) => (
                              <span key={k} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md font-mono">{k}</span>
                            ))}
                          {Object.values(event.data.categories.openai).every(v => !v) && (
                            <span className="text-slate-600">None</span>
                          )}
                        </div>
                        {event.data.categories.custom.length > 0 && (
                          <>
                            <p className="font-bold text-slate-400">Custom Rules:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {event.data.categories.custom.map(k => (
                                <span key={k} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-md font-mono">{k}</span>
                              ))}
                            </div>
                          </>
                        )}
                        <p className="text-slate-600 mt-1">Author ID: {event.data.authorId}</p>
                        {event.data.contentId && <p className="text-slate-600">Content ID: {event.data.contentId}</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {event.data.contentId && (
                      <>
                        <button
                          onClick={() => handleAction(event, 'approve')}
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(event, 'remove')}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
