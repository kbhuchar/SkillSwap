import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrowseFilters from "@/components/browse/BrowseFilters";
import UserGrid from "@/components/browse/UserGrid";
import type { Metadata } from "next";
import type { PublicUser } from "@/types";

export const metadata: Metadata = {
  title: "Browse Skills — SkillSwap",
};

interface BrowsePageProps {
  searchParams: Promise<{ skill?: string; type?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const params = await searchParams;
  const { skill, type } = params;
  const isFiltered = !!(skill || type);

  const whereClause: Record<string, unknown> = {
    id: { not: userId },
  };

  if (skill || type) {
    whereClause.skills = {
      some: {
        ...(type ? { type } : {}),
        ...(skill
          ? { skill: { name: { contains: skill, mode: "insensitive" } } }
          : {}),
      },
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: { skills: { include: { skill: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });

  const matchStatuses: Record<
    string,
    { status: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED"; matchId?: string }
  > = {};

  for (const match of matches) {
    const partnerId = match.senderId === userId ? match.receiverId : match.senderId;
    if (match.status === "ACCEPTED") {
      matchStatuses[partnerId] = { status: "ACCEPTED", matchId: match.id };
    } else if (match.status === "PENDING") {
      matchStatuses[partnerId] = {
        status: match.senderId === userId ? "PENDING_SENT" : "PENDING_RECEIVED",
        matchId: match.id,
      };
    }
  }

  const publicUsers: PublicUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    bio: u.bio,
    location: u.location,
    createdAt: u.createdAt,
    skills: u.skills,
  }));

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-end justify-between pb-1 animate-fade-up-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[#e5e5e5] tracking-tight">Browse</h1>
          <p className="text-sm text-[#888] mt-0.5">
            {isFiltered ? "Showing filtered results" : "Discover people to swap skills with"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#181818] border border-[#252525] rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-[#e5e5e5]">{publicUsers.length}</span>
          <span className="text-xs text-[#888]">people</span>
        </div>
      </div>

      {/* Sticky filters */}
      <BrowseFilters />

      {/* Grid */}
      <div className="pt-5">
        <UserGrid users={publicUsers} matchStatuses={matchStatuses} />
      </div>
    </div>
  );
}
