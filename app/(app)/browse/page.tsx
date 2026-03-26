import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrowseFilters from "@/components/browse/BrowseFilters";
import UserGrid from "@/components/browse/UserGrid";
import Link from "next/link";
import type { Metadata } from "next";
import type { PublicUser } from "@/types";

export const metadata: Metadata = {
  title: "Browse Skills — SkillSwap",
};

interface BrowsePageProps {
  searchParams: Promise<{ skill?: string; type?: string; miles?: string; category?: string }>;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const params = await searchParams;
  const { skill, type, miles: milesParam, category } = params;
  const miles = milesParam ? parseInt(milesParam) : null;
  const isFiltered = !!(skill || type || miles || category);

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { lat: true, lng: true },
  });

  const whereClause: Record<string, unknown> = {
    id: { not: userId },
  };

  if (skill || type || category) {
    const skillFilter = {
      ...(skill ? { name: { contains: skill, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
    };
    whereClause.skills = {
      some: {
        ...(type ? { type } : {}),
        ...(Object.keys(skillFilter).length > 0 ? { skill: skillFilter } : {}),
      },
    };
  }

  // If distance filter is active and we have our location, only fetch users who have coords
  if (miles && currentUser?.lat && currentUser?.lng) {
    whereClause.lat = { not: null };
    whereClause.lng = { not: null };
  }

  let users = await prisma.user.findMany({
    where: whereClause,
    include: { skills: { include: { skill: true } } },
    orderBy: { createdAt: "desc" },
    take: miles && currentUser?.lat && currentUser?.lng ? 500 : 50,
  });

  // Apply in-memory Haversine filter
  if (miles && currentUser?.lat != null && currentUser?.lng != null) {
    users = users.filter((u) => {
      if (u.lat == null || u.lng == null) return false;
      return haversineDistance(currentUser.lat!, currentUser.lng!, u.lat, u.lng) <= miles;
    });
  }

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

  const hasLocation = !!(currentUser?.lat && currentUser?.lng);

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
        <div className="flex items-center gap-2">
          <Link
            href="/discover"
            className="flex items-center gap-1.5 bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-cyan-600/20 transition-colors"
          >
            ✦ Discover
          </Link>
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#252525] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-[#e5e5e5]">{publicUsers.length}</span>
            <span className="text-xs text-[#888]">people</span>
          </div>
        </div>
      </div>

      {/* Sticky filters */}
      <BrowseFilters hasLocation={hasLocation} />

      {/* Grid */}
      <div className="pt-5">
        <UserGrid users={publicUsers} matchStatuses={matchStatuses} />
      </div>
    </div>
  );
}
