import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import HingeProfileCard from "@/components/profile/HingeProfileCard";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return {
    title: user ? `${user.name} — SkillSwap` : "Profile — SkillSwap",
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: { include: { skill: true } } },
  });

  if (!user) notFound();

  const isOwnProfile = userId === currentUserId;

  let matchStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED" = "NONE";
  let matchId: string | undefined;

  if (!isOwnProfile) {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
    });

    if (match) {
      matchId = match.id;
      if (match.status === "ACCEPTED") matchStatus = "ACCEPTED";
      else if (match.status === "PENDING")
        matchStatus = match.senderId === currentUserId ? "PENDING_SENT" : "PENDING_RECEIVED";
      else if (match.status === "DECLINED") matchStatus = "DECLINED";
    }
  }

  const skills = user.skills.map((s) => ({
    id: s.skillId,
    name: s.skill.name,
    level: s.level ?? null,
    type: s.type,
  }));

  return (
    <div className="max-w-lg mx-auto pb-8">
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#e5e5e5] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to browse
      </Link>

      <HingeProfileCard
        user={{
          id: user.id,
          name: user.name,
          image: user.image,
          photos: user.photos,
          bio: user.bio,
          location: user.location,
          dateOfBirth: user.dateOfBirth,
          skills,
        }}
        isOwnProfile={isOwnProfile}
        matchStatus={matchStatus}
        matchId={matchId}
      />
    </div>
  );
}
