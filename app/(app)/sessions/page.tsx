import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import SessionCard from "@/components/sessions/SessionCard";
import type { Metadata } from "next";
import type { SwapSessionWithUsers } from "@/types";

export const metadata: Metadata = {
  title: "Sessions — SkillSwap",
};

interface SessionsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const params = await searchParams;
  const activeTab = params.tab ?? "upcoming";

  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.swapSession.findMany({
      where: {
        OR: [{ proposerId: userId }, { receiverId: userId }],
        status: { in: ["PROPOSED", "ACCEPTED"] },
        scheduledAt: { gte: now },
      },
      include: {
        proposer: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        match: true,
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.swapSession.findMany({
      where: {
        AND: [
          { OR: [{ proposerId: userId }, { receiverId: userId }] },
          {
            OR: [
              { scheduledAt: { lt: now } },
              { status: { in: ["COMPLETED", "DECLINED", "CANCELLED"] } },
            ],
          },
        ],
      },
      include: {
        proposer: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        match: true,
      },
      orderBy: { scheduledAt: "desc" },
      take: 20,
    }),
  ]);

  const tabs = [
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcoming.length,
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: "past",
      label: "Past",
      count: past.length,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Sessions</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Your scheduled and past skill swap sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1f1f1f] rounded-lg p-1 w-fit border border-[#252525]">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/sessions?tab=${tab.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#0d0d0d] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-violet-900/20 text-violet-400"
                    : "bg-[#252525] text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Upcoming tab */}
      {activeTab === "upcoming" && (
        <div>
          {upcoming.length === 0 ? (
            <div className="bg-[#181818] rounded-xl border border-[#252525] p-8 text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                No upcoming sessions
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Connect with someone and propose a session to start learning
              </p>
              <Link
                href="/matches?tab=connected"
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                View my connections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcoming.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s as SwapSessionWithUsers}
                  currentUserId={userId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past tab */}
      {activeTab === "past" && (
        <div>
          {past.length === 0 ? (
            <div className="bg-[#181818] rounded-xl border border-[#252525] p-8 text-center">
              <div className="w-10 h-10 rounded-lg bg-[#1f1f1f] flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                No past sessions
              </h3>
              <p className="text-xs text-gray-500">
                Your completed and cancelled sessions will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {past.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s as SwapSessionWithUsers}
                  currentUserId={userId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
