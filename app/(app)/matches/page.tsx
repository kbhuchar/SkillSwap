import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MatchesTabs from "@/components/matches/MatchesTabs";
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
  const defaultTab = params.tab ?? "pending";

  const [pendingIncoming, accepted] = await Promise.all([
    prisma.match.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: { include: { skills: { include: { skill: true } } } },
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

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#e5e5e5]">Matches</h1>
        <p className="text-xs text-[#555] mt-0.5">Manage your connection requests and connections</p>
      </div>
      <MatchesTabs
        pendingIncoming={pendingIncoming}
        accepted={accepted}
        currentUserId={userId}
        defaultTab={defaultTab}
      />
    </div>
  );
}
