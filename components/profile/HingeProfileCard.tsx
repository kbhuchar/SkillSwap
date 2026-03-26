"use client";

import { useState, useRef } from "react";
import { MapPin, Briefcase, BookOpen } from "lucide-react";
import { getInitials } from "@/lib/utils";
import ConnectButton from "@/components/matches/ConnectButton";
import SkillTags from "@/components/profile/SkillTags";

interface Skill {
  id: string;
  name: string;
  level?: string | null;
  type: "OFFERED" | "WANTED";
}

interface HingeProfileCardProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    photos?: string[];
    bio: string | null;
    location: string | null;
    dateOfBirth?: Date | string | null;
    skills: Skill[];
  };
  isOwnProfile?: boolean;
  matchStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "DECLINED";
  matchId?: string;
  onEditClick?: () => void;
}

export default function HingeProfileCard({
  user,
  isOwnProfile,
  matchStatus = "NONE",
  matchId,
  onEditClick,
}: HingeProfileCardProps) {
  const photos = user.photos && user.photos.length > 0
    ? user.photos
    : user.image
    ? [user.image]
    : [];

  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const initials = getInitials(user.name);

  const offeredSkills = user.skills
    .filter((s) => s.type === "OFFERED")
    .map((s) => ({ id: s.id, name: s.name, level: s.level }));

  const wantedSkills = user.skills
    .filter((s) => s.type === "WANTED")
    .map((s) => ({ id: s.id, name: s.name, level: s.level }));

  const prev = () => setPhotoIndex((i) => Math.max(0, i - 1));
  const next = () => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) next();
    else if (delta < -40) prev();
    touchStartX.current = null;
  };

  let age: number | null = null;
  if (user.dateOfBirth) {
    const dob = new Date(user.dateOfBirth as string);
    age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  return (
    <div className="max-w-sm mx-auto w-full">
      <div className="bg-[#111111] rounded-3xl overflow-hidden shadow-2xl border border-[#1f1f1f]">

        {/* ── Photo carousel ─────────────────────────────── */}
        <div
          className="relative aspect-[3/4] overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {photos.length > 0 ? (
            <img
              key={photoIndex}
              src={photos[photoIndex]}
              alt={user.name ?? "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-[#1a1a2e] to-[#0d0d0d] flex items-center justify-center">
              <span className="text-6xl font-black text-cyan-400/20 select-none">{initials}</span>
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

          {/* Progress dots */}
          {photos.length > 1 && (
            <div className="absolute top-3 left-3 right-3 flex gap-1">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                    i === photoIndex ? "bg-white" : "bg-white/30"
                  }`}
                  onClick={() => setPhotoIndex(i)}
                />
              ))}
            </div>
          )}

          {/* Tap zones */}
          {photos.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-2/5 z-10" aria-label="Previous photo" />
              <button onClick={next} className="absolute right-0 top-0 bottom-0 w-2/5 z-10" aria-label="Next photo" />
            </>
          )}

          {/* Name + location overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pointer-events-none">
            <h1 className="text-2xl font-black text-white leading-none drop-shadow-lg">
              {user.name ?? "Anonymous"}{age ? `, ${age}` : ""}
            </h1>
            {user.location && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
                <span className="text-sm text-white/70">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable info ─────────────────────────────── */}
        <div className="overflow-y-auto divide-y divide-[#1a1a1a]" style={{ maxHeight: "55vh" }}>

          {user.bio && (
            <div className="px-5 py-4">
              <p className="text-sm text-[#bbb] leading-relaxed">{user.bio}</p>
            </div>
          )}

          {offeredSkills.length > 0 && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Teaches</span>
              </div>
              <SkillTags skills={offeredSkills} type="OFFERED" size="md" />
            </div>
          )}

          {wantedSkills.length > 0 && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-900/30 flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Learning</span>
              </div>
              <SkillTags skills={wantedSkills} type="WANTED" size="md" />
            </div>
          )}

          <div className="px-5 py-4">
            {isOwnProfile ? (
              <button
                onClick={onEditClick}
                className="w-full bg-[#1e1e1e] hover:bg-[#252525] border border-[#2a2a2a] text-white text-sm font-semibold py-3 rounded-2xl transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <ConnectButton
                targetUserId={user.id}
                initialMatchStatus={matchStatus}
                matchId={matchId}
                fullWidth
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
