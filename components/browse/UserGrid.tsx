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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2a2a2a] flex items-center justify-center mb-4 border border-[#333333]">
          <SearchX className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No users found
        </h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Try adjusting your search filters or clear them to see all available users.
        </p>
        <Link
          href="/browse"
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">
          {users.length} {users.length === 1 ? "person" : "people"} found
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
