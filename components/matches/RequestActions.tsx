"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface RequestActionsProps {
  matchId: string;
  onSuccess?: () => void;
}

export default function RequestActions({ matchId, onSuccess }: RequestActionsProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);
  const [done, setDone] = useState(false);

  const handleAction = async (status: "ACCEPTED" | "DECLINED") => {
    setActionLoading(status === "ACCEPTED" ? "accept" : "decline");
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setDone(true);
        onSuccess?.();
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update match:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (done) {
    return (
      <span className="text-sm text-slate-400 italic">Response sent</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("ACCEPTED")}
        disabled={actionLoading !== null}
        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
      >
        {actionLoading === "accept" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Accept
      </button>
      <button
        onClick={() => handleAction("DECLINED")}
        disabled={actionLoading !== null}
        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
      >
        {actionLoading === "decline" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        Decline
      </button>
    </div>
  );
}
