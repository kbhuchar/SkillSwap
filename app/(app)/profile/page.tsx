"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import EditProfileForm from "@/components/profile/EditProfileForm";
import HingeProfileCard from "@/components/profile/HingeProfileCard";

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
  dateOfBirth: string | null;
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
      if (res.ok) setProfile(await res.json());
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
      <div className="max-w-sm mx-auto">
        <div className="bg-[#111] rounded-3xl border border-[#1f1f1f] overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-[#1a1a1a]" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-[#252525] rounded w-1/2" />
            <div className="h-3 bg-[#252525] rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const skills = profile.skills.map((s) => ({
    id: s.skillId,
    name: s.name,
    level: s.level ?? null,
    type: s.type,
  }));

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto pb-8">
        <div className="bg-[#181818] border border-[#252525] rounded-2xl p-5">
          <h2 className="text-base font-bold text-white mb-5">Edit Profile</h2>
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <HingeProfileCard
        user={{
          id: profile.id,
          name: profile.name,
          image: profile.image,
          photos: profile.photos ?? [],
          bio: profile.bio,
          location: profile.location,
          dateOfBirth: profile.dateOfBirth,
          skills,
        }}
        isOwnProfile
        onEditClick={() => setIsEditing(true)}
      />
    </div>
  );
}
