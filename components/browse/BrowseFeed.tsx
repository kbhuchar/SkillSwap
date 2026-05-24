"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Info, X, Heart, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import type { PublicUser } from "@/types";

type MatchStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED";

interface FeedCardProps {
  user: PublicUser;
  matchStatus: MatchStatus;
  matchId?: string;
  onPass: () => void;
}

function FeedCard({ user, matchStatus: initialStatus, matchId: initialMatchId, onPass }: FeedCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<MatchStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const offeredSkills = user.skills.filter((s) => s.type === "OFFERED").slice(0, 3);
  const wantedSkills = user.skills.filter((s) => s.type === "WANTED").slice(0, 2);

  const handleConnect = async () => {
    if (!session?.user || loading || status !== "NONE") return;
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      if (res.ok) {
        setStatus("PENDING_SENT");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const heartFilled = status === "PENDING_SENT" || status === "ACCEPTED";
  const heartColor =
    status === "ACCEPTED" ? "bg-emerald-600 shadow-emerald-900/40" :
    status === "PENDING_SENT" ? "bg-cyan-600/70 shadow-cyan-900/30" :
    "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40";

  return (
    <div className="snap-start snap-always flex-shrink-0 h-full relative overflow-hidden bg-[#1a1a1a] sm:rounded-3xl">
      {user.image ? (
        <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-[#1a1a2e] to-[#0d0d0d] flex items-center justify-center">
          <span className="text-7xl font-black text-cyan-400/20 select-none">{getInitials(user.name)}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <Link
        href={`/profile/${user.id}`}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Info className="w-4 h-4 text-white" />
      </Link>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-16">
        <p className="text-2xl font-extrabold text-white leading-tight">{user.name ?? "Anonymous"}</p>
        {user.location && (
          <div className="flex items-center gap-1.5 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-400 truncate">{user.location}</span>
          </div>
        )}
        {(offeredSkills.length > 0 || wantedSkills.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {offeredSkills.map((s, i) => (
              <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                {s.skill.name}
              </span>
            ))}
            {wantedSkills.map((s, i) => (
              <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm">
                {s.skill.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-10">
          <button
            onClick={onPass}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 active:scale-90 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={handleConnect}
            disabled={loading || status !== "NONE"}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:cursor-default ${heartColor}`}
          >
            <Heart className={`w-6 h-6 text-white ${heartFilled ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface BrowseFeedProps {
  users: PublicUser[];
  matchStatuses: Record<string, { status: MatchStatus; matchId?: string }>;
}

export default function BrowseFeed({ users, matchStatuses }: BrowseFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToNext = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ top: container.clientHeight, behavior: "smooth" });
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-[#181818] flex items-center justify-center mb-4 border border-[#252525]">
          <SearchX className="w-6 h-6 text-[#888]" />
        </div>
        <p className="text-sm font-bold text-[#e5e5e5] mb-1.5">No results found</p>
        <p className="text-xs text-[#888] max-w-[200px] leading-relaxed">Try a different skill or clear your filters.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="snap-y snap-mandatory overflow-y-auto scrollbar-none h-full">
      {users.map((user) => {
        const matchInfo = matchStatuses[user.id];
        return (
          <FeedCard
            key={user.id}
            user={user}
            matchStatus={matchInfo?.status ?? "NONE"}
            matchId={matchInfo?.matchId}
            onPass={scrollToNext}
          />
        );
      })}
    </div>
  );
}
