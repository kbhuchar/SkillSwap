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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#242424] flex items-center justify-center mb-3 border border-[#2e2e2e]">
          <SearchX className="w-5 h-5 text-gray-600" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">No results</p>
        <p className="text-xs text-gray-600 mb-4 max-w-[200px]">
          Try a different skill or clear your filters.
        </p>
        <Link
          href="/browse"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {users.map((user) => {
        const matchInfo = matchStatuses[user.id];
        return (
          <ProfileCard
            key={user.id}
            user={user}
            showConnect={true}
            matchStatus={matchInfo?.status ?? "NONE"}
            matchId={matchInfo?.matchId}
          />
        );
      })}
    </div>
  );
}
