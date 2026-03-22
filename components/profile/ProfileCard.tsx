import Link from "next/link";
import { MapPin } from "lucide-react";
import { getInitials } from "@/lib/utils";
import SkillTags from "./SkillTags";
import ConnectButton from "@/components/matches/ConnectButton";
import type { PublicUser } from "@/types";

interface ProfileCardProps {
  user: PublicUser;
  showConnect?: boolean;
  matchStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED";
  matchId?: string;
}

export default function ProfileCard({
  user,
  showConnect = true,
  matchStatus = "NONE",
  matchId,
}: ProfileCardProps) {
  const offeredSkills = user.skills
    .filter((s) => s.type === "OFFERED")
    .map((s) => ({ id: s.skillId, name: s.skill.name, level: s.level }));

  const wantedSkills = user.skills
    .filter((s) => s.type === "WANTED")
    .map((s) => ({ id: s.skillId, name: s.skill.name, level: s.level }));

  const initials = getInitials(user.name);

  return (
    <div className="bg-[#242424] rounded-2xl border border-[#333333] shadow-sm hover:shadow-md hover:border-indigo-800/60 transition-all flex flex-col">
      <div className="p-5 flex-1">
        {/* Avatar and name */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/profile/${user.id}`} className="flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-800/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-sm font-bold ring-2 ring-indigo-800/20">
                {initials}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${user.id}`}>
              <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors truncate">
                {user.name ?? "Anonymous"}
              </h3>
            </Link>
            {user.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Skills */}
        <div className="space-y-3">
          {offeredSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Teaches
              </p>
              <SkillTags skills={offeredSkills} type="OFFERED" max={3} />
            </div>
          )}
          {wantedSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Wants to learn
              </p>
              <SkillTags skills={wantedSkills} type="WANTED" max={3} />
            </div>
          )}
        </div>
      </div>

      {/* Connect button */}
      {showConnect && (
        <div className="px-5 pb-5">
          <div className="pt-4 border-t border-[#333333]">
            <ConnectButton
              targetUserId={user.id}
              initialMatchStatus={matchStatus}
              matchId={matchId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
