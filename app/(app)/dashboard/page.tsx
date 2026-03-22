import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Clock,
  Calendar,
  ArrowRight,
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
        take: 3,
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
      label: "Connections",
      value: matchesCount,
      icon: <Users className="w-4 h-4" />,
      color: "bg-indigo-900/20 text-indigo-400",
      href: "/matches",
    },
    {
      label: "Pending",
      value: pendingIncoming,
      icon: <Clock className="w-4 h-4" />,
      color: "bg-amber-900/20 text-amber-400",
      href: "/matches",
    },
    {
      label: "Sessions",
      value: upcomingSessions,
      icon: <Calendar className="w-4 h-4" />,
      color: "bg-emerald-900/20 text-emerald-400",
      href: "/sessions",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">
            Welcome back, {session!.user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Here&apos;s what&apos;s happening with your skill swaps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/browse"
            className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Browse Skills
          </Link>
          <Link
            href="/messages"
            className="text-xs font-medium bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 px-3 py-1.5 rounded-lg border border-[#333333] transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Messages
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat: typeof stats[number]) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[#242424] rounded-xl border border-[#333333] p-4 hover:border-indigo-800/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Requests */}
        <div className="bg-[#242424] rounded-xl border border-[#333333] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-white">Pending Requests</h2>
              {pendingIncoming > 0 && (
                <span className="bg-amber-900/20 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingIncoming}
                </span>
              )}
            </div>
            <Link
              href="/matches"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          {recentPending.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-xs text-gray-500">No pending requests</p>
              <Link
                href="/browse"
                className="mt-1.5 inline-block text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Browse skills to connect
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentPending.map((match: typeof recentPending[number]) => {
                const initials = getInitials(match.sender.name);
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {match.sender.image ? (
                        <img
                          src={match.sender.image}
                          alt={match.sender.name ?? ""}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
        <div className="bg-[#242424] rounded-xl border border-[#333333] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-white">Upcoming Sessions</h2>
            </div>
            <Link
              href="/sessions"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          {upcomingSessionsList.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-xs text-gray-500">No upcoming sessions</p>
              <Link
                href="/matches"
                className="mt-1.5 inline-block text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Schedule a session with a match
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcomingSessionsList.map((session: typeof upcomingSessionsList[number]) => {
                const partner =
                  session.proposerId === userId
                    ? session.receiver
                    : session.proposer;
                const isAccepted = session.status === "ACCEPTED";

                return (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center gap-2.5 hover:bg-[#2e2e2e] rounded-lg p-1.5 -mx-1.5 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isAccepted
                          ? "bg-emerald-900/20 text-emerald-400"
                          : "bg-amber-900/20 text-amber-400"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        with {partner.name} · {formatDateTime(session.scheduledAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
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
    </div>
  );
}
