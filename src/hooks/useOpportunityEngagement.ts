"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface UseOpportunityEngagementOptions {
  id: string;
  type: "gig" | "internship";
  title: string;
  initialSaved?: boolean;
}

export function useOpportunityEngagement({
  id,
  type,
  title,
  initialSaved = false,
}: UseOpportunityEngagementOptions) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const toggleSave = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isSaving) return;

      const previousState = isSaved;
      const nextAction = previousState ? "unsave" : "save";

      // Optimistic update
      setIsSaved(!previousState);
      setIsSaving(true);

      try {
        const res = await fetch("/api/user/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            type,
            action: nextAction,
          }),
        });

        if (res.status === 401 || res.status === 403) {
          // Unauthenticated - redirect to sign-in with return URL
          setIsSaved(previousState);
          const currentUrl = typeof window !== "undefined" ? window.location.pathname : "/opportunities";
          router.push(`/auth/sign-in?returnUrl=${encodeURIComponent(currentUrl)}`);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to update saved status");
        }
      } catch (err) {
        // Rollback on error
        console.error("[useOpportunityEngagement] Save failed:", err);
        setIsSaved(previousState);
      } finally {
        setIsSaving(false);
      }
    },
    [id, type, isSaved, isSaving, router]
  );

  const shareOpportunity = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const canonicalPath = type === "gig" ? `/gigs/${id}` : `/internships/${id}`;
      const url = typeof window !== "undefined" ? `${window.location.origin}${canonicalPath}` : canonicalPath;

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: `${title} | CampusConnect`,
            text: `Check out this verified ${type} opportunity on CampusConnect: ${title}`,
            url,
          });
          return;
        } catch (err: any) {
          if (err.name === "AbortError") return;
          // Fall through to clipboard
        }
      }

      // Fallback: Clipboard copy
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setShareMessage("Link copied!");
        setTimeout(() => {
          setIsCopied(false);
          setShareMessage(null);
        }, 2200);
      } catch (clipErr) {
        console.error("[useOpportunityEngagement] Copy failed:", clipErr);
      }
    },
    [id, type, title]
  );

  return {
    isSaved,
    isSaving,
    isCopied,
    shareMessage,
    toggleSave,
    shareOpportunity,
  };
}
