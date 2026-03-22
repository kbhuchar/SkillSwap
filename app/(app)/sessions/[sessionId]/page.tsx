import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  User,
} from "lucide-react";
import { formatDateTime, formatDate, getInitials } from "@/lib/utils";
import SessionActions from "@/components/sessions/SessionActions";
import type { SwapSessionWithUsers } from "@/types";
import type { Metadata } from "next";

interface SessionDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PROPOSED: { label: "Proposed", className: "bg-amber-900/20 text-amber-400" },
  ACCEPTED: { label: "Confirmed", className: "bg-emerald-900/20 text-emerald-400" },
  DECLINED: { label: "Declined", className: "bg-red-900/20 text-red-400" },
  CANCELLED: { label: "Cancelled", className: "bg-[#2a2a2a] text-gray-500" },
  COMPLETED: { label: "Completed", className: "bg-blue-900/20 text-blue-400" },
};

export async function generateMetadata({
  params,
}: SessionDetailPageProps): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await prisma.swapSession.findUnique({
    where: { id: sessionId },
    select: { title: true },
  });
  return {
    title: session
      ? `${session.title} — SkillSwap`
      : "Session — SkillSwap",
  };
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { sessionId } = await params;
  const authSession = await auth();
  const userId = authSession!.user.id;

  const swapSession = await prisma.swapSession.findUnique({
    where: { id: sessionId },
    include: {
      proposer: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
      match: true,
    },
  });

  if (
    !swapSession ||
    (swapSession.proposerId !== userId && swapSession.receiverId !== userId)
  ) {
    notFound();
  }

  const partner =
    swapSession.proposerId === userId
      ? swapSession.receiver
      : swapSession.proposer;
  const isProposer = swapSession.proposerId === userId;
  const status =
    statusConfig[swapSession.status] ?? {
      label: swapSession.status,
      className: "bg-[#2a2a2a] text-gray-400",
    };
  const partnerInitials = getInitials(partner.name);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/sessions"
          className="p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors text-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">Session Details</h1>
          <p className="text-xs text-gray-500">
            {formatDate(swapSession.scheduledAt)}
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-[#242424] rounded-xl border border-[#333333] shadow-sm overflow-hidden">
        {/* Status banner */}
        <div
          className={`px-4 py-2.5 border-b ${
            swapSession.status === "ACCEPTED"
              ? "bg-emerald-900/10 border-emerald-900/30"
              : swapSession.status === "PROPOSED"
              ? "bg-amber-900/10 border-amber-900/30"
              : "bg-[#2a2a2a] border-[#333333]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.className}`}>
              {status.label}
            </span>
            <span className="text-xs text-gray-500">
              {isProposer ? "You proposed this session" : "Session proposed to you"}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Title and description */}
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {swapSession.title}
            </h2>
            {swapSession.description && (
              <p className="text-xs text-gray-400 leading-relaxed">
                {swapSession.description}
              </p>
            )}
          </div>

          {/* Session details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 bg-[#2a2a2a] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Scheduled</p>
                <p className="text-xs font-semibold text-white">
                  {formatDateTime(swapSession.scheduledAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-[#2a2a2a] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Duration</p>
                <p className="text-xs font-semibold text-white">
                  {swapSession.durationMin} minutes
                </p>
              </div>
            </div>
          </div>

          {/* Partner */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {isProposer ? "Session with" : "Proposed by"}
            </p>
            <Link
              href={`/profile/${partner.id}`}
              className="flex items-center gap-2.5 p-3 bg-[#2a2a2a] rounded-lg hover:bg-indigo-900/10 transition-colors group"
            >
              {partner.image ? (
                <img
                  src={partner.image}
                  alt={partner.name ?? ""}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {partnerInitials}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  {partner.name ?? "Anonymous"}
                </p>
                <p className="text-xs text-gray-500">Click to view profile</p>
              </div>
            </Link>
          </div>

          {/* Meeting link */}
          {swapSession.meetingLink && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Meeting Link
              </p>
              <a
                href={swapSession.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 bg-indigo-900/10 hover:bg-indigo-900/20 px-3 py-2 rounded-lg transition-colors text-xs font-medium border border-indigo-800/30 truncate"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                {swapSession.meetingLink}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#333333]">
            <div className="flex items-center gap-2 flex-wrap">
              <SessionActions
                session={swapSession as SwapSessionWithUsers}
                currentUserId={userId}
              />
              <Link
                href={`/messages/${swapSession.matchId}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-900/10 hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors border border-indigo-800/30"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message {partner.name?.split(" ")[0]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
