"use client";

import {
  Edit3,
  Trash2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

interface OpportunityOwnerControlsProps {
  opportunityId: string;
  opportunityType: "gig" | "internship";
  currentStatus: string;
  initialData?: {
    title: string;
    description: string;
    budget?: number | null;
    stipend?: number | null;
    duration?: string | null;
    location?: string | null;
    deadline?: Date | string | null;
    tags?: string | null;
  };
  onStatusChange?: (newStatus: string) => void;
  redirectOnDelete?: boolean;
}

export default function OpportunityOwnerControls({
  opportunityId,
  opportunityType,
  currentStatus: initialStatus,
  initialData,
  onStatusChange,
  redirectOnDelete = true,
}: OpportunityOwnerControlsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [compensation, setCompensation] = useState<string>(
    initialData?.budget !== undefined && initialData?.budget !== null
      ? String(initialData.budget)
      : initialData?.stipend !== undefined && initialData?.stipend !== null
      ? String(initialData.stipend)
      : ""
  );
  const [tags, setTags] = useState(initialData?.tags || "");

  const isActive = status === "OPEN" || status === "active";
  const isInactive = status === "INACTIVE";
  const isCompleted = status === "COMPLETED";

  const handleStatusTransition = async (targetStatus: string) => {
    setIsUpdating(true);
    try {
      const endpoint = opportunityType === "gig" ? "/api/gigs" : `/api/internships/${opportunityId}`;
      const payload = opportunityType === "gig"
        ? { id: opportunityId, status: targetStatus }
        : { id: opportunityId, status: targetStatus };

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update opportunity status");
      }

      setStatus(targetStatus);
      if (onStatusChange) onStatusChange(targetStatus);
      toast.success(
        targetStatus === "INACTIVE"
          ? "Opportunity marked as inactive"
          : targetStatus === "COMPLETED"
          ? "Opportunity marked as completed"
          : "Opportunity reactivated"
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    try {
      const endpoint = opportunityType === "gig" ? "/api/gigs" : `/api/internships/${opportunityId}`;
      const payload: any = {
        id: opportunityId,
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim() || null,
      };

      if (compensation) {
        if (opportunityType === "gig") {
          payload.budget = parseFloat(compensation);
        } else {
          payload.stipend = parseFloat(compensation);
        }
      }

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update opportunity");
      }

      toast.success("Opportunity updated successfully");
      setShowEditModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const endpoint = opportunityType === "gig"
        ? `/api/gigs?id=${opportunityId}`
        : `/api/internships/${opportunityId}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete opportunity");
      }

      toast.success("Opportunity deleted successfully");
      setShowDeleteModal(false);

      if (redirectOnDelete) {
        router.push("/client-hub");
      } else {
        setStatus("DELETED");
        if (onStatusChange) onStatusChange("DELETED");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete opportunity");
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "DELETED") {
    return (
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>This opportunity has been permanently deleted and is no longer discoverable.</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm space-y-3 my-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your Opportunity
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          )}
          {isInactive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PauseCircle className="h-3 w-3" />
              Inactive
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            disabled={isUpdating}
            className="h-8 px-3 text-xs font-semibold gap-1.5 border-border/80 hover:bg-surface"
            data-testid="owner-edit-btn"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>

          {/* Lifecycle Action: Inactive / Reactivate */}
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusTransition("INACTIVE")}
              disabled={isUpdating}
              className="h-8 px-3 text-xs font-semibold gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              data-testid="owner-mark-inactive-btn"
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <PauseCircle className="h-3.5 w-3.5" />}
              Mark Inactive
            </Button>
          )}

          {isInactive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusTransition("OPEN")}
              disabled={isUpdating}
              className="h-8 px-3 text-xs font-semibold gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              data-testid="owner-reactivate-btn"
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
              Reactivate
            </Button>
          )}

          {/* Mark Completed */}
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusTransition("COMPLETED")}
              disabled={isUpdating}
              className="h-8 px-3 text-xs font-semibold gap-1.5 text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
              data-testid="owner-mark-completed-btn"
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Mark Completed
            </Button>
          )}

          {isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusTransition("OPEN")}
              disabled={isUpdating}
              className="h-8 px-3 text-xs font-semibold gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              data-testid="owner-reopen-btn"
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
              Reopen Opportunity
            </Button>
          )}

          {/* Delete Action with Confirmation */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={isUpdating || isDeleting}
            className="h-8 px-3 text-xs font-semibold gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10"
            data-testid="owner-delete-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog for Deletion */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          data-testid="delete-confirmation-dialog"
        >
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete this opportunity?</h3>
                <p className="text-xs text-muted-foreground">This cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Deleting this post will immediately remove it from active search, nearby geographic discovery, and map markers.
              Historical applications and records remain preserved for your accounting.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                data-testid="confirm-delete-button"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          data-testid="edit-opportunity-modal"
        >
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Edit Opportunity</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="edit-title-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                  data-testid="edit-description-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {opportunityType === "gig" ? "Budget (₹)" : "Stipend (₹ / mo)"}
                  </label>
                  <input
                    type="number"
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                    min={0}
                    step={100}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="edit-compensation-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Skills / Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="React, TypeScript, Figma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="edit-tags-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditSubmit(e);
                  }}
                  disabled={isUpdating}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-dark"
                  data-testid="save-edit-button"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
