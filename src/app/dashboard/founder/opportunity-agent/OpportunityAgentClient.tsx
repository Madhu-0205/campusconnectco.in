"use client";

import {
  AlertTriangle,
  Bot,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  Loader2,
  MapPin,
  Play,
  RefreshCw,
  ShieldCheck,
  XCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const CANONICAL_CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "INTERNSHIP", label: "Internships" },
  { id: "JOB", label: "Jobs" },
  { id: "GIG", label: "Gigs / Freelance" },
  { id: "HACKATHON", label: "Hackathons" },
  { id: "FELLOWSHIP", label: "Fellowships" },
  { id: "SCHOLARSHIP", label: "Scholarships" },
  { id: "RESEARCH", label: "Research" },
  { id: "APPRENTICESHIP", label: "Apprenticeships" },
  { id: "EVENT", label: "Events" },
  { id: "OTHER", label: "Other" }
];

const FRESHNESS_FILTERS = [
  { id: "ALL", label: "All Freshness" },
  { id: "ACTIVE", label: "Current / Active" },
  { id: "STALE_REQUIRES_RECHECK", label: "Needs Recheck" },
  { id: "CONFIRMED_EXPIRED", label: "Expired" },
  { id: "CONFIRMED_INACTIVE", label: "Inactive" },
  { id: "SOURCE_UNAVAILABLE", label: "Unavailable" }
];

const REJECTION_PRESETS = [
  { code: "CONFIRMED_EXPIRED", label: "Expired — Application deadline or event date has passed" },
  { code: "APPLICATION_URL_BROKEN", label: "Broken URL — Application link returns 404 or fails to load" },
  { code: "SUSPICIOUS_RISK_FLAG", label: "Security Risk — Registration fee, WhatsApp-only, or scam flag" },
  { code: "INCORRECT_METADATA", label: "Incorrect Metadata — Misclassified category, company, or terms" },
  { code: "DUPLICATE_LISTING", label: "Duplicate — Duplicate of an existing verified opportunity" },
  { code: "LOW_QUALITY_DETAILS", label: "Low Quality — Missing role description or unverifiable employer" }
];

export default function OpportunityAgentClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("NEEDS_REVIEW");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [freshnessFilter, setFreshnessFilter] = useState("ALL");
  const [confidenceFilter, setConfidenceFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inspectingItem, setInspectingItem] = useState<any | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<any | null>(null);
  const [rejectPreset, setRejectPreset] = useState<string>("");
  const [customRejectReason, setCustomRejectReason] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, freshnessFilter, confidenceFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        type: categoryFilter,
        freshness: freshnessFilter,
        confidence: confidenceFilter
      });
      const res = await fetch(`/api/founder/opportunity-agent?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load automation data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error(err.message || "Failed to load automation dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (opportunityId: string, action: string, reason?: string) => {
    setActionLoading(opportunityId);
    try {
      const res = await fetch("/api/founder/opportunity-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, opportunityId, reason })
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Action failed");
      }

      toast.success(json.message || "Action processed successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecheckOpportunity = async (opportunityId: string) => {
    setActionLoading(opportunityId);
    toast.info("Performing live HTTP recheck and freshness evaluation...");
    try {
      const res = await fetch("/api/founder/opportunity-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recheck_opportunity", opportunityId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Recheck failed");
      toast.success(`Recheck complete: ${json.lifecycleState} (HTTP ${json.httpStatus})`);
      loadData();
      if (inspectingItem && inspectingItem.id === opportunityId) {
        setInspectingItem((prev: any) => ({
          ...prev,
          metadata: {
            ...prev?.metadata,
            lifecycleState: json.lifecycleState,
            lastVerifiedAt: json.lastVerifiedAt,
            recheckHttpStatus: json.httpStatus
          }
        }));
      }
    } catch (err: any) {
      toast.error(err.message || "Recheck failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecheckSource = async (sourceId: string) => {
    toast.info(`Triggering recheck for source "${sourceId}"...`);
    try {
      const res = await fetch("/api/founder/opportunity-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recheck_source", sourceId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Source recheck failed");
      toast.success(`Source rechecked! Items found: ${json.result?.itemsFound || 0}, Staged: ${json.result?.itemsStaged || 0}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Source recheck failed");
    }
  };

  const handleRunDueSources = async () => {
    toast.info("Running continuous scheduler for due sources...");
    try {
      const res = await fetch("/api/founder/opportunity-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_due_sources" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scheduler run failed");
      toast.success(
        `Scheduler executed! Attempted: ${json.result?.sourcesAttempted || 0}, Discovered: ${json.result?.itemsDiscovered || 0}, New: ${json.result?.itemsNew || 0}`
      );
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Scheduler run failed");
    }
  };

  const handleTriggerDiscovery = async (sourceId?: string) => {
    toast.info("Starting autonomous discovery cycle...");
    try {
      const res = await fetch("/api/founder/opportunity-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_discovery", sourceId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Discovery failed");
      toast.success(`Discovery completed! Found ${json.result?.itemsFound || 0} items.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Discovery execution failed");
    }
  };

  const metrics = data?.metrics || {
    discoveredToday: 0,
    totalDiscovered: 0,
    publishedCount: 0,
    duplicatesCount: 0,
    rejectedCount: 0,
    needsReviewCount: 0,
    autoPublishEnabled: false,
    categoryCounts: {},
    freshnessCounts: {}
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-(--primary)/10 text-(--primary) rounded-2xl border border-(--primary)/20">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
                Real Opportunity Supply Engine
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Autonomous multi-source discovery, 10-type taxonomy, deterministic quality evaluator, and Playwright Founder publishing bot.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleRunDueSources}
            className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <Clock size={16} /> Run Due Sources
          </Button>
          <Button
            onClick={() => handleTriggerDiscovery()}
            className="rounded-xl font-bold bg-(--primary) text-white hover:brightness-110 shadow-lg shadow-(--primary)/20 flex items-center gap-2"
          >
            <Play size={16} /> Run All Sources
          </Button>
          <Button
            variant="outline"
            onClick={loadData}
            className="rounded-xl font-bold border-border text-foreground flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* Safety & Gate Notice */}
      <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-amber-500 shrink-0" />
          <div className="text-sm">
            <span className="font-bold text-foreground">Phase 16 Engine Status: </span>
            <span className="text-amber-400 font-black">Founder Review Queue Gate ACTIVE</span>
            <span className="text-muted-foreground ml-2">
              (Auto-Publish is {metrics.autoPublishEnabled ? "ENABLED" : "LOCKED / DISABLED by policy"}).
            </span>
          </div>
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Dedicated Bot: opportunity-bot@campusconnectco.in
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 rounded-2xl border-border bg-card">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Today</p>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.discoveredToday}</p>
          <p className="text-[11px] text-muted-foreground">Discovered</p>
        </Card>
        <Card className="p-4 rounded-2xl border-border bg-card">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">In Review</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{metrics.needsReviewCount}</p>
          <p className="text-[11px] text-muted-foreground">Awaiting Approval</p>
        </Card>
        <Card className="p-4 rounded-2xl border-border bg-card">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Published</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.publishedCount}</p>
          <p className="text-[11px] text-muted-foreground">Live on CampusConnect</p>
        </Card>
        <Card className="p-4 rounded-2xl border-border bg-card">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Duplicates</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{metrics.duplicatesCount}</p>
          <p className="text-[11px] text-muted-foreground">Safely Prevented</p>
        </Card>
        <Card className="p-4 rounded-2xl border-border bg-card">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Rejected</p>
          <p className="text-2xl font-black text-red-400 mt-1">{metrics.rejectedCount}</p>
          <p className="text-[11px] text-muted-foreground">Spam / Low Quality</p>
        </Card>
        <Card className="p-4 rounded-2xl border-border bg-card">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Total Staged</p>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.totalDiscovered}</p>
          <p className="text-[11px] text-muted-foreground">Lifetime</p>
        </Card>
      </div>

      {/* Source Health Table */}
      <Card className="rounded-3xl border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-black text-foreground text-lg">Verified Source Registry (Phase 16B)</h2>
            <p className="text-xs text-muted-foreground">
              Continuous scheduler, exponential backoff, failure count tracking, and isolated sync.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs font-black uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Source Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Failures</th>
                <th className="px-5 py-3">Last Run</th>
                <th className="px-5 py-3">Discovered</th>
                <th className="px-5 py-3">Duplicates</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.sourceHealth?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                    No sources have been executed yet. Click &quot;Run Discovery Now&quot; to initialize.
                  </td>
                </tr>
              ) : (
                data?.sourceHealth?.map((src: any) => (
                  <tr key={src.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      <div>{src.sourceName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{src.source}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                      {src.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                          src.status === "HEALTHY"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : src.status === "DEGRADED"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : src.status === "FAILING"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-muted/50 text-muted-foreground border border-border"
                        }`}
                      >
                        {src.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono font-bold">
                      <span className={src.failureCount > 0 ? "text-red-400" : "text-muted-foreground"}>
                        {src.failureCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {src.lastRun ? new Date(src.lastRun).toLocaleString() : "Never"}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">{src.itemsFound}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{src.duplicatesCount}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleRecheckSource(src.source)}
                        className="text-xs font-bold text-(--primary) hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} /> Sync / Recheck
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Queue Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-foreground">Opportunity Review &amp; Staging Queue</h2>
              <p className="text-xs text-muted-foreground">
                Canonical 10-type taxonomy, multi-source provenance, and live freshness verification.
              </p>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {["NEEDS_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ALL"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === st
                      ? "bg-(--primary) text-white shadow-md shadow-(--primary)/20"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs (10 Canonical Types) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CANONICAL_CATEGORIES.map((cat) => {
              const count = cat.id === "ALL" ? metrics.totalDiscovered : metrics.categoryCounts?.[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    categoryFilter === cat.id
                      ? "bg-foreground text-background font-black shadow-sm"
                      : "bg-muted/40 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/60 text-muted-foreground font-mono">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Freshness Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Freshness:</span>
            {FRESHNESS_FILTERS.map((fresh) => {
              const count = fresh.id === "ALL" ? metrics.totalDiscovered : metrics.freshnessCounts?.[fresh.id] || 0;
              return (
                <button
                  key={fresh.id}
                  onClick={() => setFreshnessFilter(fresh.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    freshnessFilter === fresh.id
                      ? "bg-emerald-600 text-white shadow-sm font-black"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{fresh.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        freshnessFilter === fresh.id ? "bg-black/20 text-white" : "bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Confidence Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground mr-1">Confidence:</span>
            {[
              { id: "ALL", label: "All Confidence" },
              { id: "HIGH", label: "High Confidence (≥75)" },
              { id: "MEDIUM", label: "Medium (50–74)" },
              { id: "LOW", label: "Low (<50)" }
            ].map((conf) => (
              <button
                key={conf.id}
                onClick={() => setConfidenceFilter(conf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  confidenceFilter === conf.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {conf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunity Cards */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-(--primary)" size={32} />
            <p className="text-sm text-muted-foreground mt-2">Loading opportunities...</p>
          </div>
        ) : data?.reviewQueue?.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border-border bg-card">
            <CheckCircle className="mx-auto text-emerald-400 mb-3" size={40} />
            <h3 className="font-bold text-foreground">No Opportunities Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No records match your selected filters (Status: {statusFilter}, Category: {categoryFilter}, Freshness: {freshnessFilter}, Confidence: {confidenceFilter}).
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.reviewQueue?.map((item: any) => {
              const subtypes: string[] = item.metadata?.subtypes || [];
              const lifecycleState = item.metadata?.lifecycleState || "ACTIVE";
              const riskFlags: string[] = item.metadata?.riskFlags || [];
              const locationType = item.metadata?.locationType;
              const geography = item.metadata?.geography;

              return (
                <Card
                  key={item.id}
                  className="p-5 rounded-3xl border-border bg-card space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.opportunityType}
                      </span>
                      {subtypes.map((st: string) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-muted/60 text-muted-foreground border border-border"
                        >
                          {st}
                        </span>
                      ))}
                      {locationType && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {locationType}
                        </span>
                      )}
                      {geography && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {geography}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.sourceTrust === "OFFICIAL"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        Trust: {item.sourceTrust}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.verificationState}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          lifecycleState === "CONFIRMED_EXPIRED" || lifecycleState === "CONFIRMED_INACTIVE"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : lifecycleState === "STALE_REQUIRES_RECHECK" || lifecycleState === "SOURCE_UNAVAILABLE"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {lifecycleState}
                      </span>
                      <span className="ml-auto text-xs font-black text-foreground">
                        Quality: {item.qualityScore}/100
                      </span>
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h3 className="font-black text-foreground text-lg leading-snug line-clamp-1">{item.title}</h3>
                      <p className="text-sm font-bold text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 size={14} className="text-muted-foreground" /> {item.company}
                      </p>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-muted-foreground">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {item.location}
                        </span>
                      )}
                      {item.compensation && (
                        <span className="font-bold text-orange-400">
                          {item.currency === "USD" ? "$" : "₹"}
                          {item.compensation.toLocaleString()}
                        </span>
                      )}
                      {item.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> Deadline: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                        <Globe size={11} /> {item.sourceName}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Risk Flags Alert if any */}
                    {riskFlags.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle size={13} /> Flagged for Security Risk:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {riskFlags.map((rf: string) => (
                            <span key={rf} className="px-1.5 py-0.2 rounded bg-red-500/20 text-[10px] font-mono">
                              {rf}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {item.metadata?.warnings?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <div>
                          {item.metadata.warnings.map((w: string, i: number) => (
                            <p key={i}>{w}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Provenance */}
                  <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Source Link
                      </a>
                      <button
                        onClick={() => setInspectingItem(item)}
                        className="text-xs font-bold text-(--primary) hover:underline flex items-center gap-1"
                      >
                        <Layers size={12} /> Inspect Provenance
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid="opportunity-recheck-btn"
                        onClick={() => handleRecheckOpportunity(item.id)}
                        disabled={actionLoading === item.id}
                        className="h-8 rounded-lg text-xs font-bold border-border text-foreground hover:bg-muted/30 flex items-center gap-1"
                      >
                        <RefreshCw size={11} className={actionLoading === item.id ? "animate-spin" : ""} />
                        Recheck
                      </Button>

                      {item.status === "NEEDS_REVIEW" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRejectModalItem(item);
                              setRejectPreset("");
                              setCustomRejectReason("");
                            }}
                            disabled={actionLoading === item.id}
                            className="h-8 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAction(item.id, "approve")}
                            disabled={actionLoading === item.id}
                            className="h-8 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            Approve &amp; Publish
                          </Button>
                        </>
                      )}
                      {item.status === "REJECTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(item.id, "restore")}
                          disabled={actionLoading === item.id}
                          className="h-8 rounded-lg text-xs font-bold text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          Restore to Review
                        </Button>
                      )}
                      {item.status === "PUBLISHED" && (
                        <div className="flex items-center gap-2">
                          {item.publishedOpportunityId && (
                            <a
                              href={
                                item.publishedOpportunityType === "GIG"
                                  ? `/gigs/${item.publishedOpportunityId}`
                                  : `/internships/${item.publishedOpportunityId}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-black text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Eye size={12} /> View Published Post
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleAction(item.id, "unpublish", "Founder emergency rollback")
                            }
                            disabled={actionLoading === item.id}
                            className="h-8 rounded-lg text-xs font-bold text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                          >
                            Unpublish
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Provenance Inspection Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {inspectingItem.opportunityType}
                </span>
                <h3 className="text-xl font-black text-foreground mt-2">{inspectingItem.title}</h3>
                <p className="text-sm font-bold text-muted-foreground">{inspectingItem.company}</p>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Provenance Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Original Source</p>
                <p className="font-bold text-foreground mt-1">{inspectingItem.sourceName}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{inspectingItem.source}</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Source Trust</p>
                <p className="font-bold text-foreground mt-1">{inspectingItem.sourceTrust}</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Verification State</p>
                <p className="font-bold text-foreground mt-1">{inspectingItem.verificationState}</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Lifecycle State</p>
                <p className="font-bold text-emerald-400 mt-1">{inspectingItem.metadata?.lifecycleState || "ACTIVE"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Quality Score</p>
                <p className="font-bold text-foreground mt-1">{inspectingItem.qualityScore} / 100</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Spam Risk Score</p>
                <p className="font-bold text-foreground mt-1">{inspectingItem.spamRiskScore} / 100</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">First Discovered</p>
                <p className="font-bold text-foreground mt-1">{new Date(inspectingItem.discoveredAt).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Last Seen</p>
                <p className="font-bold text-foreground mt-1">{new Date(inspectingItem.lastSeenAt).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Last Verified</p>
                <p className="font-bold text-foreground mt-1">
                  {inspectingItem.metadata?.lastVerifiedAt
                    ? new Date(inspectingItem.metadata.lastVerifiedAt).toLocaleString()
                    : "Not Yet Verified"}
                </p>
              </div>
            </div>

            {/* Rejection Reason if any */}
            {inspectingItem.rejectionReason && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs">
                <p className="font-bold text-red-400 mb-0.5">Recorded Rejection Reason:</p>
                <p className="text-red-300">{inspectingItem.rejectionReason}</p>
              </div>
            )}

            {/* URLs */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Application URL:</p>
              <a
                href={inspectingItem.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--primary) hover:underline break-all font-mono block p-2 rounded-xl bg-muted/20 border border-border"
              >
                {inspectingItem.applicationUrl}
              </a>
            </div>

            {/* Risk Flags */}
            {inspectingItem.metadata?.riskFlags?.length > 0 && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs">
                <p className="font-bold text-red-400 mb-1">Detected Risk Flags:</p>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingItem.metadata.riskFlags.map((flag: string) => (
                    <span key={flag} className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 font-mono text-[10px]">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Immutable Audit Trail */}
            {inspectingItem.metadata?.auditTrail?.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-foreground">
                  Authoritative Audit Trail ({inspectingItem.metadata.auditTrail.length} event
                  {inspectingItem.metadata.auditTrail.length > 1 ? "s" : ""}):
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {inspectingItem.metadata.auditTrail.map((event: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-muted/20 border border-border text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {event.action} ({event.fromStatus} → {event.toStatus})
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[10px]">
                        Actor: {event.actorEmail} ({event.actorRole}
                        {event.isBot ? " • Dedicated Bot" : " • Human Founder"})
                      </p>
                      {event.reason && <p className="text-amber-300 text-[10px]">Reason: {event.reason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deduplication & Provenance Chain */}
            {inspectingItem.metadata?.provenance?.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-foreground">
                  Cross-Source Provenance Chain ({inspectingItem.metadata.provenance.length} source
                  {inspectingItem.metadata.provenance.length > 1 ? "s" : ""}):
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {inspectingItem.metadata.provenance.map((prov: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-muted/30 border border-border text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{prov.sourceName}</span>
                        <span className="text-muted-foreground font-mono">{prov.source}</span>
                      </div>
                      <p className="text-muted-foreground truncate">{prov.applicationUrl}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Seen: {new Date(prov.lastSeenAt).toLocaleDateString()}</span>
                        <span>Trust: {prov.sourceTrust}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRecheckOpportunity(inspectingItem.id)}
                disabled={actionLoading === inspectingItem.id}
                className="rounded-xl font-bold flex items-center gap-2"
              >
                <RefreshCw size={14} className={actionLoading === inspectingItem.id ? "animate-spin" : ""} />
                Recheck Opportunity Now
              </Button>
              <Button onClick={() => setInspectingItem(null)} className="rounded-xl font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Rejection Modal Dialog */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground">Reject Opportunity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rejectModalItem.title} @ {rejectModalItem.company}
                </p>
              </div>
              <button
                onClick={() => setRejectModalItem(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-bold text-foreground">Select Rejection Audit Reason:</p>
              <div className="space-y-2">
                {REJECTION_PRESETS.map(preset => (
                  <label
                    key={preset.code}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      rejectPreset === preset.code
                        ? "border-red-500/50 bg-red-500/10 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectPreset"
                      value={preset.code}
                      checked={rejectPreset === preset.code}
                      onChange={() => {
                        setRejectPreset(preset.code);
                        setCustomRejectReason(preset.label);
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-[11px] leading-snug">{preset.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <label className="font-bold text-foreground">Custom Notes / Reason (min 5 characters):</label>
                <textarea
                  value={customRejectReason}
                  onChange={e => setCustomRejectReason(e.target.value)}
                  placeholder="Specify detailed reason for audit trail..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectModalItem(null)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={customRejectReason.trim().length < 5 || actionLoading === rejectModalItem.id}
                onClick={async () => {
                  const finalReason = customRejectReason.trim();
                  await handleAction(rejectModalItem.id, "reject", finalReason);
                  setRejectModalItem(null);
                }}
                className="rounded-xl font-black bg-red-600 hover:bg-red-500 text-white shadow-md"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
