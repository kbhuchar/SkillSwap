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
    className: "bg-amber-100 text-amber-700",
  },
  ACCEPTED: {
    label: "Confirmed",
    className: "bg-emerald-100 text-emerald-700",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-100 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700",
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
    className: "bg-slate-100 text-slate-600",
  };
  const partnerInitials = getInitials(partner.name);

  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-sm p-5 transition-all",
      session.status === "ACCEPTED"
        ? "border-emerald-100 hover:shadow-md"
        : "border-slate-100"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link
            href={`/sessions/${session.id}`}
            className="font-semibold text-slate-900 hover:text-indigo-700 transition-colors"
          >
            {session.title}
          </Link>
          {session.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatDateTime(session.scheduledAt)}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          {session.durationMin} minutes
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs">
            {isProposer ? "You proposed • With" : "From"}:
          </span>
          <Link
            href={`/profile/${partner.id}`}
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
          >
            {partner.image ? (
              <img
                src={partner.image}
                alt={partner.name ?? ""}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
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
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <ExternalLink className="w-4 h-4" />
            Join meeting
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100">
        <SessionActions session={session} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
