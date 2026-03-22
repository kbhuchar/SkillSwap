"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserPlus, Clock, Check, X, MessageSquare, Loader2 } from "lucide-react";

type MatchStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED";

interface ConnectButtonProps {
  targetUserId: string;
  initialMatchStatus?: MatchStatus;
  matchId?: string;
}

export default function ConnectButton({
  targetUserId,
  initialMatchStatus = "NONE",
  matchId: initialMatchId,
}: ConnectButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<MatchStatus>(initialMatchStatus);
  const [matchId, setMatchId] = useState<string | undefined>(initialMatchId);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);

  const handleConnect = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatchId(data.id);
        setStatus("PENDING_SENT");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "ACCEPTED" | "DECLINED") => {
    if (!matchId) return;
    setActionLoading(newStatus === "ACCEPTED" ? "accept" : "decline");
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus === "ACCEPTED" ? "ACCEPTED" : "DECLINED");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update match:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "ACCEPTED" && matchId) {
    return (
      <Link
        href={`/messages/${matchId}`}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Message
      </Link>
    );
  }

  if (status === "PENDING_SENT") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 bg-[#2a2a2a] text-gray-400 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed border border-[#333333]"
      >
        <Clock className="w-4 h-4" />
        Pending
      </button>
    );
  }

  if (status === "PENDING_RECEIVED") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleUpdateStatus("ACCEPTED")}
          disabled={actionLoading !== null}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          {actionLoading === "accept" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Accept
        </button>
        <button
          onClick={() => handleUpdateStatus("DECLINED")}
          disabled={actionLoading !== null}
          className="inline-flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#333333] disabled:opacity-50 text-gray-200 text-sm font-medium px-3 py-2 rounded-xl transition-colors border border-[#444444]"
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

  if (status === "DECLINED") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 bg-[#2a2a2a] text-gray-500 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed border border-[#333333]"
      >
        <X className="w-4 h-4" />
        Declined
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      Connect
    </button>
  );
}
