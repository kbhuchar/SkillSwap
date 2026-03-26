import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Briefcase, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getInitials, formatDate } from "@/lib/utils";
import SkillTags from "@/components/profile/SkillTags";
import ConnectButton from "@/components/matches/ConnectButton";
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
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!user) notFound();

  // If viewing own profile, redirect to /profile
  const isOwnProfile = userId === currentUserId;

  // Get match status
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
      if (match.status === "ACCEPTED") {
        matchStatus = "ACCEPTED";
      } else if (match.status === "PENDING") {
        matchStatus = match.senderId === currentUserId ? "PENDING_SENT" : "PENDING_RECEIVED";
      } else if (match.status === "DECLINED") {
        matchStatus = "DECLINED";
      }
    }
  }

  const offeredSkills = user.skills
    .filter((s) => s.type === "OFFERED")
    .map((s) => ({ id: s.skillId, name: s.skill.name, level: s.level }));

  const wantedSkills = user.skills
    .filter((s) => s.type === "WANTED")
    .map((s) => ({ id: s.skillId, name: s.skill.name, level: s.level }));

  const initials = getInitials(user.name);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to browse
      </Link>

      <div className="bg-[#181818] rounded-xl border border-[#252525] shadow-sm overflow-hidden">
        {/* Header banner */}
        <div className="h-16 bg-gradient-to-r from-violet-500 to-purple-600" />

        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-8 mb-3 flex-wrap gap-2">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#242424] shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-violet-900/20 text-violet-400 flex items-center justify-center text-xl font-bold ring-2 ring-[#242424] shadow-md">
                {initials}
              </div>
            )}

            {!isOwnProfile && (
              <ConnectButton
                targetUserId={userId}
                initialMatchStatus={matchStatus}
                matchId={matchId}
              />
            )}
            {isOwnProfile && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>

          <h1 className="text-base font-bold text-white">
            {user.name ?? "Anonymous"}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                {user.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              Member since {formatDate(user.createdAt)}
            </div>
          </div>

          {user.bio && (
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#181818] rounded-xl border border-[#252525] shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/20 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Skills They Teach</h2>
          </div>
          <SkillTags skills={offeredSkills} type="OFFERED" size="md" />
          {offeredSkills.length === 0 && (
            <p className="text-xs text-gray-500 italic">No skills listed yet</p>
          )}
        </div>

        <div className="bg-[#181818] rounded-xl border border-[#252525] shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-900/20 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Skills They Want to Learn</h2>
          </div>
          <SkillTags skills={wantedSkills} type="WANTED" size="md" />
          {wantedSkills.length === 0 && (
            <p className="text-xs text-gray-500 italic">No skills listed yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
