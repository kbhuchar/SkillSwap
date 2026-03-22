import ProfileCard from "@/components/profile/ProfileCard";
import { Users, SearchX } from "lucide-react";
import Link from "next/link";
import type { PublicUser } from "@/types";

interface UserGridProps {
  users: PublicUser[];
  matchStatuses?: Record<string, { status: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED"; matchId?: string }>;
}

export default function UserGrid({ users, matchStatuses = {} }: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center mb-3 border border-[#333333]">
          <SearchX className="w-5 h-5 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          No users found
        </h3>
        <p className="text-xs text-gray-500 max-w-xs">
          Try adjusting your search filters or clear them to see all available users.
        </p>
        <Link
          href="/browse"
          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Users className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-500">
          {users.length} {users.length === 1 ? "person" : "people"} found
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
    </div>
  );
}
