import ProfileCard from "@/components/profile/ProfileCard";
import { SearchX } from "lucide-react";
import Link from "next/link";
import type { PublicUser } from "@/types";

interface UserGridProps {
  users: PublicUser[];
  matchStatuses?: Record<string, { status: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED"; matchId?: string }>;
}

export default function UserGrid({ users, matchStatuses = {} }: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-[#181818] flex items-center justify-center mb-4 border border-[#252525]">
          <SearchX className="w-6 h-6 text-[#888]" />
        </div>
        <p className="text-sm font-bold text-[#e5e5e5] mb-1.5">No results found</p>
        <p className="text-xs text-[#888] mb-5 max-w-[200px] leading-relaxed">
          Try a different skill or clear your filters.
        </p>
        <Link
          href="/browse"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Clear all filters →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {users.map((user, index) => {
        const matchInfo = matchStatuses[user.id];
        return (
          <ProfileCard
            key={user.id}
            user={user}
            showConnect={true}
            matchStatus={matchInfo?.status ?? "NONE"}
            matchId={matchInfo?.matchId}
            index={index}
          />
        );
      })}
    </div>
  );
}
