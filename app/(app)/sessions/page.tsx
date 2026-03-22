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
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "past",
      label: "Past",
      count: past.length,
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sessions</h1>
        <p className="text-gray-400 mt-1">
          Your scheduled and past skill swap sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-xl p-1 w-fit border border-[#333333]">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/sessions?tab=${tab.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#1a1a1a] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-indigo-900/20 text-indigo-400"
                    : "bg-[#333333] text-gray-400"
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
            <div className="bg-[#242424] rounded-2xl border border-[#333333] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">
                No upcoming sessions
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Connect with someone and propose a session to start learning
              </p>
              <Link
                href="/matches?tab=connected"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                View my connections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="bg-[#242424] rounded-2xl border border-[#333333] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-gray-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">
                No past sessions
              </h3>
              <p className="text-gray-500 text-sm">
                Your completed and cancelled sessions will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
