/**
 * CampusConnect v3.0 — Skeleton Components
 * Match EXACT dimensions of loaded content to prevent layout shift (CLS = 0).
 */

import React from "react";

// ─── Base shimmer wrapper ─────────────────────────────────────────────────────

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #131929 25%, #1A2240 50%, #131929 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ─── GigCardSkeleton ──────────────────────────────────────────────────────────

export function GigCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-white/[0.07] bg-[#131929]/80 space-y-4"
        >
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Shimmer className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Shimmer className="w-28 h-3.5" />
                <Shimmer className="w-20 h-2.5" />
              </div>
            </div>
            <Shimmer className="w-16 h-6 rounded-full" />
          </div>
          {/* Title */}
          <Shimmer className="w-3/4 h-4" />
          {/* Skills row */}
          <div className="flex gap-2">
            <Shimmer className="w-16 h-6 rounded-lg" />
            <Shimmer className="w-20 h-6 rounded-lg" />
            <Shimmer className="w-14 h-6 rounded-lg" />
          </div>
          {/* Footer row */}
          <div className="flex items-center justify-between pt-2 border-white/5">
            <Shimmer className="w-20 h-4" />
            <Shimmer className="w-24 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── UserCardSkeleton ─────────────────────────────────────────────────────────

export function UserCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-white/[0.07] bg-[#131929]/80 space-y-4"
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <Shimmer className="w-12 h-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Shimmer className="w-32 h-4" />
              <Shimmer className="w-40 h-3" />
            </div>
          </div>
          {/* Bio */}
          <Shimmer className="w-full h-3" />
          <Shimmer className="w-2/3 h-3" />
          {/* Skills */}
          <div className="flex gap-2 flex-wrap">
            <Shimmer className="w-14 h-5 rounded-lg" />
            <Shimmer className="w-18 h-5 rounded-lg" />
            <Shimmer className="w-16 h-5 rounded-lg" />
            <Shimmer className="w-12 h-5 rounded-lg" />
          </div>
          {/* CTA */}
          <Shimmer className="w-full h-9 rounded-xl" />
        </div>
      ))}
    </>
  );
}

// ─── StatCardSkeleton ─────────────────────────────────────────────────────────

export function StatCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl border border-white/5 bg-[#111116] space-y-4"
        >
          <div className="flex justify-between items-start">
            <Shimmer className="w-10 h-10 rounded-2xl" />
            <Shimmer className="w-12 h-5 rounded-full" />
          </div>
          <Shimmer className="w-20 h-8" />
          <Shimmer className="w-28 h-3" />
        </div>
      ))}
    </>
  );
}

// ─── TableRowSkeleton ─────────────────────────────────────────────────────────

export function TableRowSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-white/5"
        >
          <Shimmer className="w-8 h-8 rounded-lg shrink-0" />
          <Shimmer className="w-32 h-3.5 flex-1" />
          <Shimmer className="w-20 h-3.5" />
          <Shimmer className="w-16 h-6 rounded-full" />
          <Shimmer className="w-20 h-3" />
        </div>
      ))}
    </>
  );
}

// ─── MessageSkeleton ──────────────────────────────────────────────────────────

export function MessageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-2.5 ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
        >
          <Shimmer className="w-7 h-7 rounded-lg shrink-0" />
          <Shimmer
            className={`h-12 ${ i % 3 === 0 ? "w-2/5" : "w-3/5 rounded-tl-sm" }`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── DashboardSkeleton ────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse">
      {/* Welcome panel */}
      <Shimmer className="w-full h-48 rounded-4xl" />
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCardSkeleton count={4} />
      </div>
      {/* Tools nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Shimmer className="h-96 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Shimmer className="h-64 rounded-3xl" />
          <Shimmer className="h-48 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
