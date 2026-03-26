import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Clock,
  Calendar,
  ArrowRight,
  Search,
  MessageSquare,
  Zap,
} from "lucide-react";
import { formatDateTime, formatRelativeTime, getInitials } from "@/lib/utils";
import RequestActions from "@/components/matches/RequestActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — SkillSwap" };


export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [matchesCount, pendingIncoming, upcomingSessions, recentPending, nextSession, recentMessages] =
    await Promise.all([
      prisma.match.count({
        where: { OR: [{ senderId: userId }, { receiverId: userId }], status: "ACCEPTED" },
      }),
      prisma.match.count({
        where: { receiverId: userId, status: "PENDING" },
      }),
      prisma.swapSession.count({
        where: {
          OR: [{ proposerId: userId }, { receiverId: userId }],
          status: { in: ["PROPOSED", "ACCEPTED"] },
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.match.findMany({
        where: { receiverId: userId, status: "PENDING" },
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.swapSession.findFirst({
        where: {
          OR: [{ proposerId: userId }, { receiverId: userId }],
          status: { in: ["PROPOSED", "ACCEPTED"] },
          scheduledAt: { gte: new Date() },
        },
        include: {
          proposer: { select: { id: true, name: true, image: true } },
          receiver: { select: { id: true, name: true, image: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.match.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: "ACCEPTED",
          messages: { some: {} },
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
          receiver: { select: { id: true, name: true, image: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
    ]);

  const hasActivity = matchesCount > 0 || pendingIncoming > 0 || upcomingSessions > 0;

  return (
    <div className="max-w-4xl mx-auto pb-8 space-y-6">

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up-1">
        <Link
          href="/matches?tab=connected"
          className="group relative bg-[#181818] border border-[#252525] hover:border-cyan-500/40 rounded-2xl p-4 transition-all hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500 rounded-t-2xl" />
          <p className="text-3xl font-black text-[#e5e5e5] mb-1.5">{matchesCount}</p>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-cyan-400" />
            <span className="text-xs font-medium text-[#888]">Connected</span>
          </div>
        </Link>

        <Link
          href="/matches"
          className="group relative bg-[#181818] border border-[#252525] hover:border-red-500/40 rounded-2xl p-4 transition-all hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500 rounded-t-2xl" />
          {pendingIncoming > 0 && (
            <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {pendingIncoming}
            </span>
          )}
          <p className="text-3xl font-black text-[#e5e5e5] mb-1.5">{pendingIncoming}</p>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-red-400" />
            <span className="text-xs font-medium text-[#888]">Pending</span>
          </div>
        </Link>

        <Link
          href="/sessions"
          className="group relative bg-[#181818] border border-[#252525] hover:border-white/20 rounded-2xl p-4 transition-all hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-white rounded-t-2xl" />
          <p className="text-3xl font-black text-[#e5e5e5] mb-1.5">{upcomingSessions}</p>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#ccc]" />
            <span className="text-xs font-medium text-[#888]">Sessions</span>
          </div>
        </Link>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <Link
        href="/browse"
        className="animate-fade-up-3 flex items-center justify-between w-full animate-shimmer active:scale-[0.98] text-white px-5 py-3.5 rounded-2xl transition-all group shadow-lg shadow-cyan-900/30"
      >
        <div className="flex items-center gap-3">
          <Search size={16} />
          <span className="text-sm font-semibold">Find your next match</span>
        </div>
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* ── Main content grid ─────────────────────────────────────── */}
      {hasActivity ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 animate-fade-up-4">

          {/* Left column — wider */}
          <div className="md:col-span-3 space-y-5">

            {/* Pending requests */}
            {recentPending.length > 0 && (
              <div className="bg-[#181818] border border-[#252525] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#e5e5e5]">New Requests</h2>
                    <span className="bg-amber-500/10 text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                      {pendingIncoming}
                    </span>
                  </div>
                  <Link href="/matches" className="text-xs text-[#888] hover:text-[#e5e5e5] transition-colors flex items-center gap-1">
                    See all <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="p-4 space-y-3">
                  {recentPending.map((match) => {
                    const senderInitials = getInitials(match.sender.name);
                    return (
                      <div key={match.id} className="flex items-center gap-3">
                        <Link href={`/profile/${match.sender.id}`} className="flex-shrink-0">
                          {match.sender.image ? (
                            <img
                              src={match.sender.image}
                              alt={match.sender.name ?? ""}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center text-xs font-bold">
                              {senderInitials}
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#e5e5e5]">
                            {match.sender.name ?? "Anonymous"}
                          </p>
                          <p className="text-xs text-[#888]">
                            {formatRelativeTime(match.createdAt)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <RequestActions matchId={match.id} compact />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent messages */}
            {recentMessages.length > 0 && (
              <div className="bg-[#181818] border border-[#252525] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
                  <h2 className="text-sm font-bold text-[#e5e5e5]">Recent Messages</h2>
                  <Link href="/messages" className="text-xs text-[#888] hover:text-[#e5e5e5] transition-colors flex items-center gap-1">
                    See all <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="divide-y divide-[#252525]">
                  {recentMessages.map((match) => {
                    const partner = match.senderId === userId ? match.receiver : match.sender;
                    const lastMsg = match.messages[0];
                    const partnerInitials = getInitials(partner.name);
                    const isOwn = lastMsg?.senderId === userId;
                    return (
                      <Link
                        key={match.id}
                        href={`/messages/${match.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#1f1f1f] transition-colors"
                      >
                        {partner.image ? (
                          <img src={partner.image} alt={partner.name ?? ""} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {partnerInitials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#e5e5e5] truncate">{partner.name}</p>
                          <p className="text-xs text-[#888] truncate">
                            {isOwn ? "You: " : ""}{lastMsg?.content ?? ""}
                          </p>
                        </div>
                        <span className="text-[11px] text-[#888] flex-shrink-0">
                          {lastMsg ? formatRelativeTime(lastMsg.createdAt) : ""}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — narrower */}
          <div className="md:col-span-2 space-y-5">

            {/* Next session */}
            {nextSession ? (() => {
              const partner = nextSession.proposerId === userId ? nextSession.receiver : nextSession.proposer;
              const isAccepted = nextSession.status === "ACCEPTED";
              const partnerInitials = getInitials(partner.name);
              return (
                <div className="bg-[#181818] border border-[#252525] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
                    <h2 className="text-sm font-bold text-[#e5e5e5]">Next Session</h2>
                    <Link href="/sessions" className="text-xs text-[#888] hover:text-[#e5e5e5] transition-colors flex items-center gap-1">
                      See all <ArrowRight size={11} />
                    </Link>
                  </div>
                  <Link href={`/sessions/${nextSession.id}`} className="block p-5 hover:bg-[#1f1f1f] transition-colors">
                    <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${isAccepted ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAccepted ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {isAccepted ? "Confirmed" : "Awaiting confirmation"}
                    </div>
                    <p className="text-sm font-semibold text-[#e5e5e5] mb-3 leading-snug">{nextSession.title}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={13} className="text-[#888]" />
                      <p className="text-xs text-[#888]">{formatDateTime(nextSession.scheduledAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {partner.image ? (
                        <img src={partner.image} alt={partner.name ?? ""} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-cyan-600/10 text-cyan-400 flex items-center justify-center text-[9px] font-bold">
                          {partnerInitials}
                        </div>
                      )}
                      <p className="text-xs text-[#888]">with {partner.name}</p>
                    </div>
                  </Link>
                </div>
              );
            })() : (
              <div className="bg-[#181818] border border-[#252525] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-[#888]" />
                  <h2 className="text-sm font-bold text-[#e5e5e5]">Sessions</h2>
                </div>
                <p className="text-xs text-[#888] mb-4 leading-relaxed">No upcoming sessions yet. Once you connect with someone, propose a session.</p>
                <Link href="/sessions" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                  View sessions <ArrowRight size={12} />
                </Link>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* ── Empty state ──────────────────────────────────────────── */
        <div className="bg-[#181818] border border-[#252525] rounded-2xl p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 mb-5">
            <Zap size={24} className="text-cyan-400" />
          </div>
          <p className="text-base font-bold text-[#e5e5e5] mb-2">Nothing here yet</p>
          <p className="text-sm text-[#888] mb-6 max-w-xs mx-auto leading-relaxed">
            Start by browsing people and sending your first connection request.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <Search size={15} />
            Browse Skills
          </Link>
        </div>
      )}

    </div>
  );
}
