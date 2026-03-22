import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Clock, Calendar, ArrowRight, Search, Zap } from "lucide-react";
import { formatDateTime, formatRelativeTime, getInitials } from "@/lib/utils";
import RequestActions from "@/components/matches/RequestActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — SkillSwap" };

function getGreeting(name: string) {
  const h = new Date().getHours();
  const first = name.split(" ")[0];
  if (h < 12) return `Good morning, ${first}`;
  if (h < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, matchesCount, pendingIncoming, upcomingSessions, recentPending, nextSession] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true },
      }),
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
    ]);

  const greeting = getGreeting(user?.name ?? session!.user.name ?? "there");
  const initials = getInitials(user?.name ?? null);

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-4">

      {/* ── Hero greeting ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-2">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center text-lg font-bold ring-2 ring-indigo-500/20 flex-shrink-0">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">{greeting}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s your activity</p>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/matches?tab=connected" className="group bg-[#242424] border border-[#2e2e2e] hover:border-indigo-500/30 rounded-2xl p-4 text-center transition-all">
          <p className="text-4xl font-black text-white mb-1">{matchesCount}</p>
          <div className="flex items-center justify-center gap-1 text-indigo-400">
            <Users size={12} />
            <span className="text-xs font-medium">Connected</span>
          </div>
        </Link>
        <Link href="/matches" className="group relative bg-[#242424] border border-[#2e2e2e] hover:border-amber-500/30 rounded-2xl p-4 text-center transition-all">
          {pendingIncoming > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
              {pendingIncoming}
            </span>
          )}
          <p className="text-4xl font-black text-white mb-1">{pendingIncoming}</p>
          <div className="flex items-center justify-center gap-1 text-amber-400">
            <Clock size={12} />
            <span className="text-xs font-medium">Pending</span>
          </div>
        </Link>
        <Link href="/sessions" className="group bg-[#242424] border border-[#2e2e2e] hover:border-emerald-500/30 rounded-2xl p-4 text-center transition-all">
          <p className="text-4xl font-black text-white mb-1">{upcomingSessions}</p>
          <div className="flex items-center justify-center gap-1 text-emerald-400">
            <Calendar size={12} />
            <span className="text-xs font-medium">Sessions</span>
          </div>
        </Link>
      </div>

      {/* ── Primary CTA ───────────────────────────────────────────── */}
      <Link
        href="/browse"
        className="flex items-center justify-between w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white px-6 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Search size={18} />
          </div>
          <div>
            <p className="text-base font-bold">Find your next match</p>
            <p className="text-xs text-indigo-200">Browse skills available now</p>
          </div>
        </div>
        <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* ── Pending requests ──────────────────────────────────────── */}
      {recentPending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">New Requests</h2>
              <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                {pendingIncoming}
              </span>
            </div>
            <Link href="/matches" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
              See all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {recentPending.map((match) => {
              const senderInitials = getInitials(match.sender.name);
              return (
                <div key={match.id} className="flex-shrink-0 w-36 bg-[#242424] border border-[#2e2e2e] rounded-2xl p-3 flex flex-col items-center gap-2.5">
                  <Link href={`/profile/${match.sender.id}`} className="flex flex-col items-center gap-2">
                    {match.sender.image ? (
                      <img
                        src={match.sender.image}
                        alt={match.sender.name ?? ""}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center text-lg font-bold">
                        {senderInitials}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white truncate max-w-[112px]">
                        {match.sender.name ?? "Anonymous"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {formatRelativeTime(match.createdAt)}
                      </p>
                    </div>
                  </Link>
                  <RequestActions matchId={match.id} compact />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Next session ──────────────────────────────────────────── */}
      {nextSession ? (() => {
        const partner = nextSession.proposerId === userId ? nextSession.receiver : nextSession.proposer;
        const isAccepted = nextSession.status === "ACCEPTED";
        const partnerInitials = getInitials(partner.name);
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Next Session</h2>
              <Link href="/sessions" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                See all <ArrowRight size={12} />
              </Link>
            </div>
            <Link
              href={`/sessions/${nextSession.id}`}
              className="group block bg-[#242424] border border-[#2e2e2e] hover:border-emerald-500/30 rounded-2xl p-5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isAccepted ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                  <Calendar size={22} className={isAccepted ? "text-emerald-400" : "text-amber-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">{nextSession.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {partner.image ? (
                      <img src={partner.image} alt={partner.name ?? ""} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center text-[8px] font-bold">
                        {partnerInitials}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      with {partner.name} · {formatDateTime(nextSession.scheduledAt)}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${isAccepted ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {isAccepted ? "Confirmed" : "Pending"}
                </span>
              </div>
            </Link>
          </div>
        );
      })() : null}

      {/* ── Empty state (no activity at all) ──────────────────────── */}
      {matchesCount === 0 && pendingIncoming === 0 && upcomingSessions === 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mb-4">
            <Zap size={24} className="text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Nothing here yet</p>
          <p className="text-xs text-gray-500 mb-4">Start by browsing skills and sending your first connection.</p>
          <Link href="/browse" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            Browse Skills <ArrowRight size={14} />
          </Link>
        </div>
      )}

    </div>
  );
}
