"use client";

import { useState, useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserPlus, Check, Clock, X, MessageCircle, Loader2, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked";

interface ConnectionButtonProps {
  /** UUID of the target user */
  targetUserId: string;
  /** Current connection status with this user */
  initialStatus: ConnectionStatus;
  /** Connection request ID (if exists) */
  connectionId?: string;
  /** Target user's name for messaging */
  targetUsername?: string;
  /** Compact mode for smaller cards */
  compact?: boolean;
}

/**
 * Self-contained connection button that manages its own loading state.
 * Handles all connection flows: send, accept, reject, cancel.
 *
 * RULES:
 *   none           → "Connect" purple → sends request
 *   pending_sent   → "Request Sent" disabled + "Cancel" dropdown
 *   pending_received → "Accept" green + "Decline" ghost
 *   accepted       → "Message" teal → navigates to /messages
 *   blocked        → hidden (renders nothing)
 */
export default function ConnectionButton({
  targetUserId,
  initialStatus,
  connectionId,
  targetUsername,
  compact = false,
}: ConnectionButtonProps) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
  const [connId, setConnId] = useState(connectionId);
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const router = useRouter();

  const sendRequest = useCallback(async () => {
    setLoading(true);
    const prevStatus = status;
    setStatus("pending_sent"); // Optimistic

    try {
      const res = await fetch("/api/network/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: targetUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send request");
      }

      const data = await res.json();
      setConnId(data.connection.id);
      toast.success("Connection request sent!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send request";
      setStatus(prevStatus);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [status, targetUserId]);

  const handleAction = useCallback(
    async (action: "accept" | "reject" | "cancel") => {
      if (!connId) return;
      setLoading(true);

      const optimisticMap: Record<string, ConnectionStatus> = {
        accept: "accepted",
        reject: "none",
        cancel: "none",
      };
      const prevStatus = status;
      setStatus(optimisticMap[action]);

      try {
        const res = await fetch("/api/network/connections", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId: connId, action }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to ${action}`);
        }

        const messages: Record<string, string> = {
          accept: "Connection accepted!",
          reject: "Request declined",
          cancel: "Request cancelled",
        };
        toast.success(messages[action]);

        if (action === "cancel" || action === "reject") {
          setConnId(undefined);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to cancel request";
        setStatus(prevStatus);
        toast.error(msg);
      } finally {
        setLoading(false);
        setShowCancel(false);
      }
    },
    [connId, status]
  );

  // Size classes
  const sz = compact
    ? "h-8 px-3 text-xs gap-1.5"
    : "h-9 px-4 text-sm gap-2";

  const baseBtn =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed";

  // BLOCKED → render nothing
  if (status === "blocked") return null;

  // ACCEPTED → Message button
  if (status === "accepted") {
    return (
      <button
        onClick={() => router.push(`/messages?with=${targetUsername || targetUserId}`)}
        className={`${baseBtn} ${sz} bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]`}
      >
        <MessageCircle size={compact ? 13 : 15} />
        Message
      </button>
    );
  }

  // PENDING (I sent) → "Request Sent" + Cancel
  if (status === "pending_sent") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowCancel((v) => !v)}
          className={`${baseBtn} ${sz} bg-white/5 text-slate-400 border border-white/10 cursor-default`}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={compact ? 13 : 15} className="animate-spin" />
          ) : (
            <Clock size={compact ? 13 : 15} />
          )}
          Request Sent
        </button>
        {showCancel && (
          <button
            onClick={() => handleAction("cancel")}
            className="absolute top-full mt-1 right-0 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131929] border border-white/10 font-medium text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors whitespace-nowrap shadow-xl"
          >
            <X size={12} /> Cancel Request
          </button>
        )}
      </div>
    );
  }

  // PENDING (I received) → Accept + Decline
  if (status === "pending_received") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction("accept")}
          disabled={loading}
          className={`${baseBtn} ${sz} bg-[#10B981] text-white hover:bg-[#10B981]/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]`}
        >
          {loading ? (
            <Loader2 size={compact ? 13 : 15} className="animate-spin" />
          ) : (
            <Check size={compact ? 13 : 15} />
          )}
          Accept
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={loading}
          className={`${baseBtn} ${sz} bg-transparent text-slate-400 border border-white/15 hover:bg-white/5 hover:border-white/30`}
        >
          Decline
        </button>
      </div>
    );
  }

  // NONE → Connect
  return (
    <button
      onClick={sendRequest}
      disabled={loading}
      className={`${baseBtn} ${sz} bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]`}
    >
      {loading ? (
        <Loader2 size={compact ? 13 : 15} className="animate-spin" />
      ) : (
        <UserPlus size={compact ? 13 : 15} />
      )}
      Connect
    </button>
  );
}
