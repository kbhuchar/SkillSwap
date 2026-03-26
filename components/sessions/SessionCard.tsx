import Link from "next/link";
import { Calendar, Clock, ExternalLink, User } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";
import SessionActions from "./SessionActions";
import type { SwapSessionWithUsers } from "@/types";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: SwapSessionWithUsers;
  currentUserId: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PROPOSED: {
    label: "Proposed",
    className: "bg-amber-900/20 text-amber-400",
  },
  ACCEPTED: {
    label: "Confirmed",
    className: "bg-emerald-900/20 text-emerald-400",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-900/20 text-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-[#252525] text-gray-500",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-violet-900/20 text-violet-400",
  },
};

export default function SessionCard({ session, currentUserId }: SessionCardProps) {
  const partner =
    session.proposerId === currentUserId
      ? session.receiver
      : session.proposer;
  const isProposer = session.proposerId === currentUserId;
  const status = statusConfig[session.status] ?? {
    label: session.status,
    className: "bg-[#252525] text-gray-400",
  };
  const partnerInitials = getInitials(partner.name);

  return (
    <div className={cn(
      "bg-[#181818] rounded-xl border p-4 transition-all",
      session.status === "ACCEPTED"
        ? "border-emerald-800/40 hover:shadow-md hover:shadow-emerald-900/10"
        : "border-[#252525]"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <Link
            href={`/sessions/${session.id}`}
            className="text-sm font-semibold text-white hover:text-violet-400 transition-colors block truncate"
          >
            {session.title}
          </Link>
          {session.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {session.description}
            </p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          {formatDateTime(session.scheduledAt)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          {session.durationMin} minutes
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <User className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-600">
            {isProposer ? "You proposed · With" : "From"}:
          </span>
          <Link
            href={`/profile/${partner.id}`}
            className="flex items-center gap-1 hover:text-violet-400 transition-colors"
          >
            {partner.image ? (
              <img
                src={partner.image}
                alt={partner.name ?? ""}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-violet-900/20 text-violet-400 flex items-center justify-center text-[9px] font-bold">
                {partnerInitials}
              </div>
            )}
            {partner.name ?? "Anonymous"}
          </Link>
        </div>
        {session.meetingLink && session.status === "ACCEPTED" && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Join meeting
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2.5 border-t border-[#252525]">
        <SessionActions session={session} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
