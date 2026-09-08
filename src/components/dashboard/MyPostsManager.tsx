"use client";

import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Search,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";

import OpportunityOwnerControls from "@/components/opportunities/OpportunityOwnerControls";
import { Button } from "@/components/ui/Button";

export interface ManagedOpportunity {
  id: string;
  type: "gig" | "internship";
  title: string;
  description: string;
  status: string;
  location?: string | null;
  compensation?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  applicationsCount: number;
  tags?: string | null;
}

interface MyPostsManagerProps {
  initialOpportunities: ManagedOpportunity[];
}

export default function MyPostsManager({ initialOpportunities }: MyPostsManagerProps) {
  const [opportunities, setOpportunities] = useState<ManagedOpportunity[]>(initialOpportunities);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    const nonDeleted = opportunities.filter((o) => o.status !== "DELETED");
    return {
      all: nonDeleted.length,
      active: nonDeleted.filter((o) => o.status === "OPEN" || o.status === "active").length,
      inactive: nonDeleted.filter((o) => o.status === "INACTIVE").length,
      completed: nonDeleted.filter((o) => o.status === "COMPLETED").length,
    };
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      if (opp.status === "DELETED") return false;

      // Tab filter
      if (activeTab === "ACTIVE" && opp.status !== "OPEN" && opp.status !== "active") return false;
      if (activeTab === "INACTIVE" && opp.status !== "INACTIVE") return false;
      if (activeTab === "COMPLETED" && opp.status !== "COMPLETED") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchDesc = opp.description.toLowerCase().includes(q);
        const matchLoc = opp.location?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      return true;
    });
  }, [opportunities, activeTab, searchQuery]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus, updatedAt: new Date() } : o))
    );
  };

  return (
    <div className="space-y-6" data-testid="my-posts-manager">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            My Posts
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your opportunities, track applications, and update lifecycle statuses.
          </p>
        </div>

        <Link href="/client-hub/post-gig">
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
            <PlusCircle className="h-4 w-4" />
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface rounded-xl border border-border/60">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-all"
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "ACTIVE"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-active"
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => setActiveTab("INACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "INACTIVE"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-inactive"
          >
            Inactive ({counts.inactive})
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "COMPLETED"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-completed"
          >
            Completed ({counts.completed})
          </button>
        </div>

        <div className="relative min-w-55">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Post Cards */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card/50">
          <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">No opportunities found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            {activeTab === "ALL"
              ? "You haven't posted any opportunities yet. Post your first gig to start building candidate pipelines."
              : `No ${activeTab.toLowerCase()} opportunities match your current filter.`}
          </p>
          {activeTab !== "ALL" ? (
            <Button variant="outline" size="sm" onClick={() => setActiveTab("ALL")}>
              View All Posts
            </Button>
          ) : (
            <Link href="/client-hub/post-gig">
              <Button size="sm" className="bg-primary text-primary-foreground font-bold">
                Create First Opportunity
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 transition-all shadow-xs space-y-4"
              data-testid={`opportunity-card-${opp.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      opp.type === "gig" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {opp.type}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                      <Link
                        href={opp.type === "gig" ? `/gigs/${opp.id}` : `/internships/${opp.id}`}
                        className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        {opp.title}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
                      </Link>
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {opp.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-1 text-right shrink-0">
                  {opp.compensation && (
                    <span className="font-black text-sm text-foreground">
                      ₹{opp.compensation.toLocaleString()}
                    </span>
                  )}
                  <Link
                    href={`/client-hub/applicants?gigId=${opp.id}`}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Users className="h-3 w-3" />
                    {opp.applicationsCount} {opp.applicationsCount === 1 ? "applicant" : "applicants"}
                  </Link>
                </div>
              </div>

              {/* Metadata details */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
                {opp.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {opp.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {new Date(opp.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[11px] text-muted-foreground/80">
                  Updated {new Date(opp.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Owner Action Bar */}
              <OpportunityOwnerControls
                opportunityId={opp.id}
                opportunityType={opp.type}
                currentStatus={opp.status}
                initialData={{
                  title: opp.title,
                  description: opp.description,
                  budget: opp.type === "gig" ? opp.compensation : undefined,
                  stipend: opp.type === "internship" ? opp.compensation : undefined,
                  tags: opp.tags,
                }}
                onStatusChange={(newStatus) => handleStatusChange(opp.id, newStatus)}
                redirectOnDelete={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
