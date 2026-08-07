"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, UserPlus, Inbox, Sparkles, RotateCcw,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";

import UserCard from "@/components/networking/UserCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { UserCardSkeleton } from "@/components/ui/Skeletons";
import { safeArray } from "@/lib/utils/safe";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "accepted" | "blocked";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  skills: string | null;
  role: string;
  userSkills?: { skill: { name: string } }[];
}

interface ConnectionData {
  connectionId: string;
  status: string;
  direction: string;
  user: UserData;
  sentAt: string;
  message?: string;
}

type Tab = "discover" | "connections" | "pending";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: "discover", label: "Discover", icon: Sparkles },
  { key: "connections", label: "My Network", icon: Users },
  { key: "pending", label: "Pending", icon: Inbox },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as Tab) || "discover";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");

  // Discover state
  const [discoverUsers, setDiscoverUsers] = useState<UserData[]>([]);
  const [discoverStatuses] = useState<
    Record<string, { status: ConnectionStatus; connectionId?: string }>
  >({});
  const [loadingDiscover, setLoadingDiscover] = useState(true);

  // Connections state
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Pending state
  const [pendingReceived, setPendingReceived] = useState<ConnectionData[]>([]);
  const [pendingSent, setPendingSent] = useState<ConnectionData[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // ─── Tab change ───────────────────────────────────────────────────────────

  const switchTab = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      router.replace(`/network?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  // ─── Fetch discover users ────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab !== "discover") return;
    let cancelled = false;

    const fetchDiscover = async () => {
      setLoadingDiscover(true);
      try {
        const res = await fetch("/api/network/users");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          const users = Array.isArray(data) ? data : data.users || [];
          setDiscoverUsers(users);
        }
      } catch (err) {
        console.error("[discover]", err);
        if (!cancelled) toast.error("Failed to load discovery feed");
      } finally {
        if (!cancelled) setLoadingDiscover(false);
      }
    };
    fetchDiscover();
    return () => { cancelled = true; };
  }, [activeTab]);

  // ─── Fetch connections ────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab !== "connections") return;
    let cancelled = false;

    const fetchConnections = async () => {
      setLoadingConnections(true);
      try {
        const res = await fetch("/api/network/connections?status=ACCEPTED");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setConnections(data.connections || []);
      } catch {
        if (!cancelled) toast.error("Failed to load connections");
      } finally {
        if (!cancelled) setLoadingConnections(false);
      }
    };
    fetchConnections();
    return () => { cancelled = true; };
  }, [activeTab]);

  // ─── Fetch pending ───────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab !== "pending") return;
    let cancelled = false;

    const fetchPending = async () => {
      setLoadingPending(true);
      try {
        const res = await fetch("/api/network/connections?status=PENDING");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          const all: ConnectionData[] = data.connections || [];
          setPendingReceived(all.filter((c) => c.direction === "received"));
          setPendingSent(all.filter((c) => c.direction === "sent"));
        }
      } catch {
        if (!cancelled) toast.error("Failed to load pending requests");
      } finally {
        if (!cancelled) setLoadingPending(false);
      }
    };
    fetchPending();
    return () => { cancelled = true; };
  }, [activeTab]);

  // ─── Client-side search ──────────────────────────────────────────────────

  const filteredDiscoverUsers = useMemo(() => {
    if (!search.trim()) return discoverUsers;
    const q = search.toLowerCase();
    return discoverUsers.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = u.email.toLowerCase();
      const skills = safeArray<string>(u.skills).join(" ").toLowerCase();
      const userSkills = (u.userSkills || []).map((us) => us.skill.name).join(" ").toLowerCase();
      return name.includes(q) || email.includes(q) || skills.includes(q) || userSkills.includes(q);
    });
  }, [search, discoverUsers]);

  const filteredConnections = useMemo(() => {
    if (!search.trim()) return connections;
    const q = search.toLowerCase();
    return connections.filter((c) => (c.user.name || "").toLowerCase().includes(q));
  }, [search, connections]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="md:text-4xl font-black text-foreground tracking-tight mb-3">
          Discover Your Network
        </h1>
        <p className="max-w-2xl mx-auto text-sm">
          Connect with ambitious students, co-founders, and collaborators across campuses.
        </p>
      </div>

      {/* Search */}
      <div className="cc-glass rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or college…"
              className="w-full bg-[#0F1629] border border-border rounded-xl pl-10 pr-4 py-3 text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/30 transition-all"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent rounded-lg font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-[#0F1629] p-1 rounded-xl border border-white/5 w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          let count: number | null = null;
          if (tab.key === "connections") count = connections.length;
          if (tab.key === "pending") count = pendingReceived.length + pendingSent.length;

          return (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${ isActive ? "bg-[#7C3AED] text-foreground shadow-[0_0_20px_rgba(124,58,237,0.3)]" : "text-muted-foreground hover:text-foreground hover:bg-accent" }`}
            >
              <Icon size={15} />
              {tab.label}
              {count !== null && count > 0 && (
                <span
                  className={`ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold ${ isActive ? "bg-white/20" : "bg-accent text-muted-foreground" }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <ErrorBoundary section="NetworkContent">
        <AnimatePresence mode="wait">
          {activeTab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loadingDiscover ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <UserCardSkeleton count={9} />
                </div>
              ) : filteredDiscoverUsers.length === 0 ? (
                <EmptyState
                  icon={<Users size={32} className="text-muted-foreground" />}
                  title="No profiles found"
                  description={
                    search
                      ? `No results for "${search}". Try adjusting your search.`
                      : "No students to discover yet. Check back soon!"
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDiscoverUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      connectionStatus={discoverStatuses[user.id]?.status ?? "none"}
                      connectionId={discoverStatuses[user.id]?.connectionId}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "connections" && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loadingConnections ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <UserCardSkeleton count={6} />
                </div>
              ) : filteredConnections.length === 0 ? (
                <EmptyState
                  icon={<UserPlus size={32} className="text-muted-foreground" />}
                  title="No connections yet"
                  description="Start connecting with students in the Discover tab to build your network."
                  ctaLabel="Discover Students"
                  onCta={() => switchTab("discover")}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredConnections.map((conn) => (
                    <UserCard
                      key={conn.connectionId}
                      user={conn.user}
                      connectionStatus="accepted"
                      connectionId={conn.connectionId}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {loadingPending ? (
                <div className="space-y-4">
                  <UserCardSkeleton count={3} />
                </div>
              ) : (
                <>
                  {/* Received */}
                  <section>
                    <h3 className="font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Inbox size={15} className="text-[#7C3AED]" />
                      Requests I Received ({pendingReceived.length})
                    </h3>
                    {pendingReceived.length === 0 ? (
                      <p className="text-muted-foreground py-4">No pending requests.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingReceived.map((conn) => (
                          <UserCard
                            key={conn.connectionId}
                            user={conn.user}
                            connectionStatus="pending_received"
                            connectionId={conn.connectionId}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Sent */}
                  <section>
                    <h3 className="font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UserPlus size={15} className="text-[#0EA5E9]" />
                      Requests I Sent ({pendingSent.length})
                    </h3>
                    {pendingSent.length === 0 ? (
                      <p className="text-muted-foreground py-4">No sent requests.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingSent.map((conn) => (
                          <UserCard
                            key={conn.connectionId}
                            user={conn.user}
                            connectionStatus="pending_sent"
                            connectionId={conn.connectionId}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent border border-border flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-sm font-semibold hover:bg-[#7C3AED]/90 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] active:scale-[0.97] transition-all"
        >
          <Sparkles size={15} />
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
