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
    // Break out of AppShell's p-4 horizontal padding on mobile, fill height between topbar and bottom nav
    <div className="-mx-4 sm:mx-auto sm:max-w-sm h-[calc(100dvh-3rem-3.5rem-2rem)] sm:h-[calc(100dvh-8.5rem)]">
      <DiscoverDeck users={publicUsers} />
    </div>
  );
}
