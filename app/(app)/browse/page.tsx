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

  const whereClause: Record<string, unknown> = {
    id: { not: userId },
  };

  if (skill || type) {
    whereClause.skills = {
      some: {
        ...(type ? { type } : {}),
        ...(skill
          ? {
              skill: {
                name: {
                  contains: skill,
                  mode: "insensitive",
                },
              },
            }
          : {}),
      },
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      skills: {
        include: { skill: true },
      },
    },
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
    {
      status: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED";
      matchId?: string;
    }
  > = {};

  for (const match of matches) {
    const partnerId =
      match.senderId === userId ? match.receiverId : match.senderId;
    if (match.status === "ACCEPTED") {
      matchStatuses[partnerId] = { status: "ACCEPTED", matchId: match.id };
    } else if (match.status === "PENDING") {
      if (match.senderId === userId) {
        matchStatuses[partnerId] = { status: "PENDING_SENT", matchId: match.id };
      } else {
        matchStatuses[partnerId] = { status: "PENDING_RECEIVED", matchId: match.id };
      }
    }
  }

  const publicUsers: PublicUser[] = users.map((u: typeof users[number]) => ({
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
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Browse</h1>
        <p className="text-sm text-gray-500 mt-0.5">{publicUsers.length} people available</p>
      </div>

      <BrowseFilters />

      <UserGrid users={publicUsers} matchStatuses={matchStatuses} />
    </div>
  );
}
