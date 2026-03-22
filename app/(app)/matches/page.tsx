import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Clock, UserCheck } from "lucide-react";
import MatchCard from "@/components/matches/MatchCard";
import RequestActions from "@/components/matches/RequestActions";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches — SkillSwap",
};

interface MatchesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const params = await searchParams;
  const activeTab = params.tab ?? "pending";

  const [pendingIncoming, accepted] = await Promise.all([
    prisma.match.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: { include: { skills: { include: { skill: true } } } },
        receiver: { include: { skills: { include: { skill: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.match.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
      },
      include: {
        sender: { include: { skills: { include: { skill: true } } } },
        receiver: { include: { skills: { include: { skill: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const tabs = [
    {
      id: "pending",
      label: "Pending",
      count: pendingIncoming.length,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "connected",
      label: "Connected",
      count: accepted.length,
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Matches</h1>
        <p className="text-gray-400 mt-1">
          Manage your connection requests and connected members
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-xl p-1 w-fit border border-[#333333]">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/matches?tab=${tab.id}`}
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
                    ? tab.id === "pending"
                      ? "bg-amber-900/20 text-amber-400"
                      : "bg-emerald-900/20 text-emerald-400"
                    : "bg-[#333333] text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Pending tab */}
      {activeTab === "pending" && (
        <div>
          {pendingIncoming.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl border border-[#333333] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">
                No pending requests
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                When someone sends you a connection request, it will appear here.
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Users className="w-4 h-4" />
                Browse Skills
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingIncoming.map((match: typeof pendingIncoming[number]) => {
                const initials = getInitials(match.sender.name);
                return (
                  <div
                    key={match.id}
                    className="bg-[#242424] rounded-2xl border border-[#333333] shadow-sm p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${match.sender.id}`}>
                          {match.sender.image ? (
                            <img
                              src={match.sender.image}
                              alt={match.sender.name ?? ""}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                              {initials}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${match.sender.id}`}
                            className="font-semibold text-white hover:text-indigo-400 transition-colors"
                          >
                            {match.sender.name ?? "Anonymous"}
                          </Link>
                          <p className="text-xs text-gray-500">
                            Sent {formatRelativeTime(match.createdAt)}
                          </p>
                        </div>
                      </div>
                      <RequestActions matchId={match.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Connected tab */}
      {activeTab === "connected" && (
        <div>
          {accepted.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl border border-[#333333] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">
                No connections yet
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Accept pending requests or send new ones to start connecting.
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Users className="w-4 h-4" />
                Find People to Connect With
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accepted.map((match: typeof accepted[number]) => (
                <MatchCard
                  key={match.id}
                  match={match}
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
