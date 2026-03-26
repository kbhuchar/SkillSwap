"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MapPin, RefreshCw, Info, X, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import type { PublicUser } from "@/types";

interface CardProps {
  user: PublicUser;
  onPass: () => void;
}

function DiscoverCard({ user, onPass }: CardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<"NONE" | "PENDING_SENT">("NONE");
  const [loading, setLoading] = useState(false);

  const offeredSkills = user.skills.filter((s) => s.type === "OFFERED").slice(0, 3);
  const wantedSkills = user.skills.filter((s) => s.type === "WANTED").slice(0, 2);

  const handleConnect = async () => {
    if (!session?.user || loading || status === "PENDING_SENT") return;
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

  return (
    <div className="snap-start snap-always flex-shrink-0 h-full relative overflow-hidden bg-[#1a1a1a] sm:rounded-3xl">
      {/* Photo */}
      {user.image ? (
        <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-[#1a1a2e] to-[#0d0d0d] flex items-center justify-center">
          <span className="text-7xl font-black text-cyan-400/20 select-none">{getInitials(user.name)}</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* View profile */}
      <Link
        href={`/profile/${user.id}`}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Info className="w-4.5 h-4.5 text-white" />
      </Link>

      {/* Info */}
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

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={onPass}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
              status === "PENDING_SENT"
                ? "bg-emerald-600 shadow-emerald-900/40"
                : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40"
            }`}
          >
            <Heart className={`w-6 h-6 text-white transition-all ${status === "PENDING_SENT" ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface DiscoverDeckProps {
  users: PublicUser[];
}

export default function DiscoverDeck({ users }: DiscoverDeckProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToNext = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ top: container.clientHeight, behavior: "smooth" });
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
          <RefreshCw className="w-5 h-5 text-[#444]" />
        </div>
        <p className="font-semibold text-[#e5e5e5]">You've seen everyone</p>
        <p className="text-sm text-[#555] mt-1">Check back later for new people</p>
        <Link href="/browse" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mt-3">
          Browse all →
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="snap-y snap-mandatory overflow-y-auto scrollbar-none h-full"
    >
      {users.map((user) => (
        <DiscoverCard key={user.id} user={user} onPass={scrollToNext} />
      ))}
    </div>
  );
}
