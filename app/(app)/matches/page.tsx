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
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: "connected",
      label: "Connected",
      count: accepted.length,
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Matches</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage your connection requests and connected members
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1f1f1f] rounded-lg p-1 w-fit border border-[#252525]">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/matches?tab=${tab.id}`}
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
                    ? tab.id === "pending"
                      ? "bg-amber-900/20 text-amber-400"
                      : "bg-emerald-900/20 text-emerald-400"
                    : "bg-[#252525] text-gray-400"
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
            <div className="bg-[#181818] rounded-xl border border-[#252525] p-8 text-center">
              <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">
                No pending requests
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                When someone sends you a connection request, it will appear here.
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Browse Skills
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingIncoming.map((match: typeof pendingIncoming[number]) => {
                const initials = getInitials(match.sender.name);
                return (
                  <div
                    key={match.id}
                    className="bg-[#181818] rounded-xl border border-[#252525] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Link href={`/profile/${match.sender.id}`}>
                          {match.sender.image ? (
                            <img
                              src={match.sender.image}
                              alt={match.sender.name ?? ""}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-cyan-900/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                              {initials}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${match.sender.id}`}
                            className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
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
            <div className="bg-[#181818] rounded-xl border border-[#252525] p-8 text-center">
              <UserCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">
                No connections yet
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Accept pending requests or send new ones to start connecting.
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Find People to Connect With
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
