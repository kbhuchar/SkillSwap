"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import type { SwapSessionWithUsers } from "@/types";

interface SessionActionsProps {
  session: SwapSessionWithUsers;
  currentUserId: string;
}

export default function SessionActions({
  session,
  currentUserId,
}: SessionActionsProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isProposer = session.proposerId === currentUserId;
  const isReceiver = session.receiverId === currentUserId;

  const handleAction = async (status: string) => {
    setActionLoading(status);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update session:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (done) {
    return <span className="text-sm text-slate-400 italic">Updated</span>;
  }

  // Terminal states — no actions
  if (["COMPLETED", "DECLINED", "CANCELLED"].includes(session.status)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Proposer can cancel */}
      {isProposer && session.status === "PROPOSED" && (
        <button
          onClick={() => handleAction("CANCELLED")}
          disabled={actionLoading !== null}
          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          {actionLoading === "CANCELLED" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Cancel
        </button>
      )}

      {/* Receiver can accept or decline */}
      {isReceiver && session.status === "PROPOSED" && (
        <>
          <button
            onClick={() => handleAction("ACCEPTED")}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
          >
            {actionLoading === "ACCEPTED" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Accept
          </button>
          <button
            onClick={() => handleAction("DECLINED")}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
          >
            {actionLoading === "DECLINED" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            Decline
          </button>
        </>
      )}

      {/* Either party can cancel an accepted session */}
      {(isProposer || isReceiver) && session.status === "ACCEPTED" && (
        <button
          onClick={() => handleAction("CANCELLED")}
          disabled={actionLoading !== null}
          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          {actionLoading === "CANCELLED" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Cancel Session
        </button>
      )}
    </div>
  );
}
