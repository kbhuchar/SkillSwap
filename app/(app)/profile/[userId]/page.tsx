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
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/browse"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to browse
      </Link>

      <div className="bg-[#242424] rounded-2xl border border-[#333333] shadow-sm overflow-hidden">
        {/* Header banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4 flex-wrap gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#242424] shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-3xl font-bold ring-4 ring-[#242424] shadow-md">
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
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white">
            {user.name ?? "Anonymous"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                {user.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              Member since {formatDate(user.createdAt)}
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-gray-400 leading-relaxed">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#242424] rounded-2xl border border-[#333333] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="font-semibold text-white">Skills They Teach</h2>
          </div>
          <SkillTags skills={offeredSkills} type="OFFERED" size="md" />
          {offeredSkills.length === 0 && (
            <p className="text-sm text-gray-500 italic">No skills listed yet</p>
          )}
        </div>

        <div className="bg-[#242424] rounded-2xl border border-[#333333] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold text-white">Skills They Want to Learn</h2>
          </div>
          <SkillTags skills={wantedSkills} type="WANTED" size="md" />
          {wantedSkills.length === 0 && (
            <p className="text-sm text-gray-500 italic">No skills listed yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
