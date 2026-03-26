"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Calendar, MapPin } from "lucide-react";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import SkillTags from "@/components/profile/SkillTags";
import ProposeSessionForm from "@/components/sessions/ProposeSessionForm";
import type { MatchWithUsers } from "@/types";

interface MatchCardProps {
  match: MatchWithUsers;
  currentUserId: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
  BLOCKED: "bg-slate-100 text-slate-600",
};

export default function MatchCard({ match, currentUserId }: MatchCardProps) {
  const [showSessionForm, setShowSessionForm] = useState(false);

  const partner =
    match.senderId === currentUserId ? match.receiver : match.sender;

  const offeredSkills = partner.skills
    .filter((s) => s.type === "OFFERED")
    .map((s) => ({ id: s.skillId, name: s.skill.name, level: s.level }));

  const wantedSkills = partner.skills
    .filter((s) => s.type === "WANTED")
    .map((s) => ({ id: s.skillId, name: s.skill.name, level: s.level }));

  const initials = getInitials(partner.name);
  const isAccepted = match.status === "ACCEPTED";

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${partner.id}`}>
              {partner.image ? (
                <img
                  src={partner.image}
                  alt={partner.name ?? ""}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-50"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold ring-2 ring-violet-50">
                  {initials}
                </div>
              )}
            </Link>
            <div>
              <Link
                href={`/profile/${partner.id}`}
                className="font-semibold text-slate-900 hover:text-violet-700 transition-colors"
              >
                {partner.name ?? "Anonymous"}
              </Link>
              {partner.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{partner.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                statusColors[match.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {match.status.charAt(0) + match.status.slice(1).toLowerCase()}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(match.createdAt)}
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2 mb-4">
          {offeredSkills.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-2">
                Teaches:
              </span>
              <SkillTags skills={offeredSkills} type="OFFERED" max={3} />
            </div>
          )}
          {wantedSkills.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-2">
                Wants:
              </span>
              <SkillTags skills={wantedSkills} type="WANTED" max={3} />
            </div>
          )}
        </div>

        {/* Actions */}
        {isAccepted && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <Link
              href={`/messages/${match.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Link>
            <button
              onClick={() => setShowSessionForm(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule Session
            </button>
          </div>
        )}
      </div>

      {showSessionForm && (
        <ProposeSessionForm
          matchId={match.id}
          onSuccess={() => setShowSessionForm(false)}
          onClose={() => setShowSessionForm(false)}
        />
      )}
    </>
  );
}
