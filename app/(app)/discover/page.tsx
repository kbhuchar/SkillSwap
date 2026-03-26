import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DiscoverDeck from "@/components/discover/DiscoverDeck";
import type { Metadata } from "next";
import type { PublicUser } from "@/types";

export const metadata: Metadata = {
  title: "Discover — SkillSwap",
};

export default async function DiscoverPage() {
  const session = await auth();
  const userId = session!.user.id;

  const existingMatches = await prisma.match.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    select: { senderId: true, receiverId: true },
  });

  const excludedIds = new Set<string>([userId]);
  for (const m of existingMatches) {
    excludedIds.add(m.senderId);
    excludedIds.add(m.receiverId);
  }

  const users = await prisma.user.findMany({
    where: { id: { notIn: Array.from(excludedIds) } },
    include: { skills: { include: { skill: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

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
    <div className="max-w-sm mx-auto flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-[#e5e5e5] tracking-tight">Discover</h1>
        <p className="text-xs text-[#555] mt-0.5">{publicUsers.length} people to explore</p>
      </div>
      <DiscoverDeck users={publicUsers} />
    </div>
  );
}
