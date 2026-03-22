import Link from "next/link";
import { MapPin } from "lucide-react";
import { getInitials } from "@/lib/utils";
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
    .map((s) => s.skill.name);

  const wantedSkills = user.skills
    .filter((s) => s.type === "WANTED")
    .map((s) => s.skill.name);

  const topSkills = [
    ...offeredSkills.slice(0, 2).map((name) => ({ name, type: "OFFERED" as const })),
    ...wantedSkills.slice(0, 1).map((name) => ({ name, type: "WANTED" as const })),
  ];

  const initials = getInitials(user.name);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a] hover:border-indigo-500/40 transition-all flex flex-col shadow-sm hover:shadow-lg hover:shadow-indigo-900/10">
      {/* Photo */}
      <Link href={`/profile/${user.id}`} className="relative aspect-square block flex-shrink-0">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-[#1a1a2e] to-[#1a1a1a] flex items-center justify-center">
            <span className="text-5xl font-black text-indigo-400/40 select-none">
              {initials}
            </span>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Info on top of gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <p className="text-sm font-bold text-white leading-tight truncate">
            {user.name ?? "Anonymous"}
          </p>
          {user.location && (
            <div className="flex items-center gap-1 mt-0.5 mb-2">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{user.location}</span>
            </div>
          )}
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topSkills.map((s, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.type === "OFFERED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/25"
                      : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/25"
                  }`}
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Connect strip */}
      {showConnect && (
        <div className="p-2.5 bg-[#1e1e1e]">
          <ConnectButton
            targetUserId={user.id}
            initialMatchStatus={matchStatus}
            matchId={matchId}
            fullWidth
          />
        </div>
      )}
    </div>
  );
}
