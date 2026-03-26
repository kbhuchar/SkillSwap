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
  index?: number;
}

export default function ProfileCard({
  user,
  showConnect = true,
  matchStatus = "NONE",
  matchId,
  index = 0,
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
  const delay = Math.min(index * 40, 400);

  const statusBadge =
    matchStatus === "ACCEPTED"
      ? { label: "Connected", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
      : matchStatus === "PENDING_SENT"
      ? { label: "Sent", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
      : matchStatus === "PENDING_RECEIVED"
      ? { label: "Received", cls: "bg-violet-500/20 text-violet-400 border-violet-500/30" }
      : null;

  return (
    <div
      className="animate-fade-up group relative rounded-2xl overflow-hidden bg-[#111111] border border-[#1f1f1f] hover:border-violet-500/40 transition-all duration-300 flex flex-col hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-900/15"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Full-card link overlay — sits behind all content */}
      <Link
        href={`/profile/${user.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${user.name ?? "user"}'s profile`}
      />

      {/* Photo */}
      <div className="relative aspect-square flex-shrink-0">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-950 via-[#1a1a2e] to-[#0d0d0d] flex items-center justify-center">
            <span className="text-4xl font-black text-violet-400/30 select-none">
              {initials}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Shine on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges — above the link overlay */}
        <div className="relative z-10">
          {statusBadge && (
            <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${statusBadge.cls}`}>
              {statusBadge.label}
            </div>
          )}
          {user.skills.length > 0 && (
            <div className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 text-[#888] border border-white/10 backdrop-blur-sm">
              {user.skills.length} skills
            </div>
          )}
        </div>

        {/* Info overlay — above the link */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <p className="text-xs font-bold text-white leading-tight truncate">
            {user.name ?? "Anonymous"}
          </p>
          {user.location && (
            <div className="flex items-center gap-1 mt-0.5 mb-1.5">
              <MapPin className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-400 truncate">{user.location}</span>
            </div>
          )}
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topSkills.map((s, i) => (
                <span
                  key={i}
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${
                    s.type === "OFFERED"
                      ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                      : "bg-violet-500/25 text-violet-300 border border-violet-500/30"
                  }`}
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connect strip — z-10 so it sits above the card link overlay */}
      {showConnect && (
        <div className="relative z-10 p-2 bg-[#0f0f0f] border-t border-[#1f1f1f]">
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
