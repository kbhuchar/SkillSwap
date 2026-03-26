"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Edit2, X, Calendar, Briefcase, BookOpen } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import SkillTags from "@/components/profile/SkillTags";
import EditProfileForm from "@/components/profile/EditProfileForm";

interface Skill {
  skillId: string;
  name: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  type: "OFFERED" | "WANTED";
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  photos: string[];
  bio: string | null;
  location: string | null;
  createdAt: string;
  skills: Skill[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/users/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-[#181818] rounded-xl border border-[#252525] p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#252525]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#252525] rounded w-1/3" />
              <div className="h-3 bg-[#252525] rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const offeredSkills = profile.skills
    .filter((s) => s.type === "OFFERED")
    .map((s) => ({ id: s.skillId, name: s.name, level: s.level }));

  const wantedSkills = profile.skills
    .filter((s) => s.type === "WANTED")
    .map((s) => ({ id: s.skillId, name: s.name, level: s.level }));

  const initials = getInitials(profile.name);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">My Profile</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your profile and skills</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-[#181818] rounded-xl border border-[#252525] shadow-sm overflow-hidden">
        {/* Header banner */}
        <div className="h-16 bg-gradient-to-r from-cyan-500 to-cyan-600" />

        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-8 mb-3">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name ?? "Profile"}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#242424] shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-cyan-900/20 text-cyan-400 flex items-center justify-center text-xl font-bold ring-2 ring-[#242424] shadow-md">
                {initials}
              </div>
            )}
          </div>

          {isEditing ? (
            <EditProfileForm
              userId={profile.id}
              initialData={{
                name: profile.name,
                bio: profile.bio,
                location: profile.location,
                image: profile.image,
                photos: profile.photos ?? [],
                skillsOffered: profile.skills
                  .filter((s) => s.type === "OFFERED")
                  .map((s) => ({ skillId: s.skillId, name: s.name, level: s.level })),
                skillsWanted: profile.skills
                  .filter((s) => s.type === "WANTED")
                  .map((s) => ({ skillId: s.skillId, name: s.name, level: s.level })),
              }}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => {
                setIsEditing(false);
                fetchProfile();
              }}
            />
          ) : (
            <>
              <h2 className="text-base font-bold text-white">
                {profile.name ?? "Anonymous"}
              </h2>
              <p className="text-xs text-gray-400">{profile.email}</p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  Joined {formatDate(profile.createdAt)}
                </div>
              </div>

              {profile.bio && (
                <p className="mt-3 text-xs text-gray-400 leading-relaxed">{profile.bio}</p>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <h3 className="text-xs font-semibold text-gray-200">
                      Skills I Teach
                    </h3>
                    <span className="text-xs text-gray-500">({offeredSkills.length})</span>
                  </div>
                  <SkillTags skills={offeredSkills} type="OFFERED" size="md" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <h3 className="text-xs font-semibold text-gray-200">
                      Skills I Want to Learn
                    </h3>
                    <span className="text-xs text-gray-500">({wantedSkills.length})</span>
                  </div>
                  <SkillTags skills={wantedSkills} type="WANTED" size="md" />
                </div>
              </div>

              {offeredSkills.length === 0 && wantedSkills.length === 0 && (
                <div className="mt-4 bg-cyan-900/20 rounded-xl p-3 text-center border border-cyan-800/30">
                  <p className="text-xs text-cyan-400 font-medium mb-0.5">
                    No skills added yet
                  </p>
                  <p className="text-xs text-cyan-400/70">
                    Edit your profile to add skills and start getting matched
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
