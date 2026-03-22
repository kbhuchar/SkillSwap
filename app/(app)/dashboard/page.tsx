import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { formatDateTime, formatRelativeTime, getInitials } from "@/lib/utils";
import RequestActions from "@/components/matches/RequestActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — SkillSwap",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  // Fetch stats and data in parallel
  const [matchesCount, pendingIncoming, upcomingSessions, recentPending] =
    await Promise.all([
      prisma.match.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: "ACCEPTED",
        },
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
        include: {
          sender: {
            select: { id: true, name: true, image: true, location: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const upcomingSessionsList = await prisma.swapSession.findMany({
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
    take: 3,
  });

  const stats = [
    {
      label: "Total Connections",
      value: matchesCount,
      icon: <Users className="w-5 h-5" />,
      color: "bg-indigo-900/20 text-indigo-400",
      href: "/matches",
    },
    {
      label: "Pending Requests",
      value: pendingIncoming,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-amber-900/20 text-amber-400",
      href: "/matches",
    },
    {
      label: "Upcoming Sessions",
      value: upcomingSessions,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-emerald-900/20 text-emerald-400",
      href: "/sessions",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session!.user.name?.split(" ")[0] ?? "there"}! 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your skill swaps
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat: typeof stats[number]) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[#242424] rounded-2xl border border-[#333333] p-6 hover:shadow-md hover:border-indigo-800/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-[#242424] rounded-2xl border border-[#333333] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-white">Pending Requests</h2>
              {pendingIncoming > 0 && (
                <span className="bg-amber-900/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingIncoming}
                </span>
              )}
            </div>
            <Link
              href="/matches"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          {recentPending.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500">No pending requests</p>
              <Link
                href="/browse"
                className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Browse skills to connect
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPending.map((match: typeof recentPending[number]) => {
                const initials = getInitials(match.sender.name);
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {match.sender.image ? (
                        <img
                          src={match.sender.image}
                          alt={match.sender.name ?? ""}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/profile/${match.sender.id}`}
                          className="text-sm font-medium text-white hover:text-indigo-400 transition-colors truncate block"
                        >
                          {match.sender.name ?? "Anonymous"}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(match.createdAt)}
                        </p>
                      </div>
                    </div>
                    <RequestActions matchId={match.id} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-[#242424] rounded-2xl border border-[#333333] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold text-white">Upcoming Sessions</h2>
            </div>
            <Link
              href="/sessions"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          {upcomingSessionsList.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500">No upcoming sessions</p>
              <Link
                href="/matches"
                className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Schedule a session with a match
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessionsList.map((session: typeof upcomingSessionsList[number]) => {
                const partner =
                  session.proposerId === userId
                    ? session.receiver
                    : session.proposer;
                const initials = getInitials(partner.name);
                const isAccepted = session.status === "ACCEPTED";

                return (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center gap-3 hover:bg-[#2e2e2e] rounded-xl p-2 -mx-2 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isAccepted
                          ? "bg-emerald-900/20 text-emerald-400"
                          : "bg-amber-900/20 text-amber-400"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        with {partner.name} ·{" "}
                        {formatDateTime(session.scheduledAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isAccepted
                          ? "bg-emerald-900/20 text-emerald-400"
                          : "bg-amber-900/20 text-amber-400"
                      }`}
                    >
                      {session.status.charAt(0) +
                        session.status.slice(1).toLowerCase()}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Ready to grow?</p>
              <p className="text-indigo-200 text-sm">
                Browse skills and connect with learners
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/browse"
              className="bg-[#1a1a1a] text-indigo-400 hover:bg-[#242424] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Browse Skills
            </Link>
            <Link
              href="/messages"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
