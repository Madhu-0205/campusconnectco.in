"use client";

import React, { useEffect, useState } from "react";
import { Bot, RefreshCw, CheckCircle, AlertTriangle, XCircle, ShieldCheck, Database, Clock } from "lucide-react";

interface AgentRunUI {
  id: string;
  agentType: string;
  entityType: string;
  entityId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  model?: string;
  inputSummary?: string;
  outputSummary?: string;
  error?: string;
  decisions?: Array<{
    decisionType: string;
    decision: string;
    reason: string;
  }>;
}

export default function AdminAgentsPage() {
  const [runs, setRuns] = useState<AgentRunUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/agents");
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error("Failed to load agent runs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleTriggerCycle = async () => {
    try {
      setTriggering(true);
      setMessage(null);
      const res = await fetch("/api/admin/agents", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Success: Checked ${data.telemetry?.monitoring?.checkedCount ?? 0} items.`);
        await fetchRuns();
      } else {
        setMessage("Cycle trigger failed.");
      }
    } catch {
      setMessage("Error triggering cycle.");
    } finally {
      setTriggering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> COMPLETED
          </span>
        );
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" /> RUNNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI Agent Intelligence Console</h1>
              <p className="text-sm text-neutral-400">
                Auditable agent runs, tri-dimensional verification decisions, and automated background jobs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRuns}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={handleTriggerCycle}
              disabled={triggering}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Trigger Automation Cycle
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-neutral-900 border border-indigo-500/30 text-indigo-300 text-sm">
            {message}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">Active Agents</div>
            <div className="text-2xl font-bold text-white">3 Deployed</div>
            <div className="text-xs text-neutral-400 mt-1">Intelligence, Verification, Matching</div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">Verification Model</div>
            <div className="text-2xl font-bold text-emerald-400">Tri-Dimensional</div>
            <div className="text-xs text-neutral-400 mt-1">Source Trust ≠ Authenticity ≠ Destination</div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">Audit Policy</div>
            <div className="text-2xl font-bold text-indigo-400">Strict Gates</div>
            <div className="text-xs text-neutral-400 mt-1">Zero unverified AI mutations allowed</div>
          </div>
        </div>

        {/* Runs Table */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Agent Execution Records</h2>
            <span className="text-xs text-neutral-500">{runs.length} runs recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800/80 bg-neutral-950/40 text-neutral-400 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Agent</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Entity</th>
                  <th className="px-5 py-3 font-semibold">Decision / Output</th>
                  <th className="px-5 py-3 font-semibold">Started</th>
                  <th className="px-5 py-3 font-semibold">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                      No agent execution records logged yet. Trigger an automation cycle to run agents.
                    </td>
                  </tr>
                ) : (
                  runs.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                        <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <div>{r.agentType}</div>
                          <div className="text-[10px] text-neutral-500">{r.id.slice(0, 8)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{getStatusBadge(r.status)}</td>
                      <td className="px-5 py-3 text-neutral-300">
                        <div className="font-mono text-[11px]">{r.entityType}</div>
                        <div className="text-[10px] text-neutral-500">{r.entityId.slice(0, 12)}...</div>
                      </td>
                      <td className="px-5 py-3 text-neutral-300 max-w-xs truncate">
                        {r.outputSummary ||
                          (r.decisions && r.decisions[0]?.decision) ||
                          "—"}
                      </td>
                      <td className="px-5 py-3 text-neutral-400 whitespace-nowrap">
                        {new Date(r.startedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3 text-rose-400 font-mono text-[10px] max-w-xs truncate">
                        {r.error || "None"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
