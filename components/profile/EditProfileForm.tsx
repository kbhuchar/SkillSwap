"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Check } from "lucide-react";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile";

interface Skill {
  skillId: string;
  name: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

interface EditProfileFormProps {
  userId: string;
  initialData: {
    name?: string | null;
    bio?: string | null;
    location?: string | null;
    image?: string | null;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
  };
  onCancel: () => void;
  onSuccess: () => void;
}

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export default function EditProfileForm({
  userId,
  initialData,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const router = useRouter();
  const [skillsOffered, setSkillsOffered] = useState<Skill[]>(
    initialData.skillsOffered
  );
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>(
    initialData.skillsWanted
  );
  const [newOfferedName, setNewOfferedName] = useState("");
  const [newWantedName, setNewWantedName] = useState("");
  const [newOfferedLevel, setNewOfferedLevel] =
    useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [newWantedLevel, setNewWantedLevel] =
    useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name ?? "",
      bio: initialData.bio ?? "",
      location: initialData.location ?? "",
      image: initialData.image ?? "",
    },
  });

  const addOfferedSkill = () => {
    const name = newOfferedName.trim();
    if (!name) return;
    if (skillsOffered.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkillsOffered([
      ...skillsOffered,
      { skillId: `temp-${Date.now()}`, name, level: newOfferedLevel },
    ]);
    setNewOfferedName("");
  };

  const addWantedSkill = () => {
    const name = newWantedName.trim();
    if (!name) return;
    if (skillsWanted.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkillsWanted([
      ...skillsWanted,
      { skillId: `temp-${Date.now()}`, name, level: newWantedLevel },
    ]);
    setNewWantedName("");
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          skillsOffered,
          skillsWanted,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to update profile");
        return;
      }

      router.refresh();
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            {...register("name")}
            className="w-full px-4 py-2.5 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1.5">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. New York, NY"
            {...register("location")}
            className="w-full px-4 py-2.5 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-400">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1.5">
          Bio
        </label>
        <textarea
          rows={3}
          placeholder="Tell others about yourself and what you're passionate about..."
          {...register("bio")}
          className="w-full px-4 py-2.5 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
        />
        {errors.bio && (
          <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1.5">
          Avatar URL
        </label>
        <input
          type="url"
          placeholder="https://..."
          {...register("image")}
          className="w-full px-4 py-2.5 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        {errors.image && (
          <p className="mt-1 text-xs text-red-400">{errors.image.message}</p>
        )}
      </div>

      {/* Skills Offered */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Skills I Can Teach
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skillsOffered.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-emerald-900/20 text-emerald-400 text-sm px-3 py-1 rounded-full border border-emerald-800/30"
            >
              {s.name}
              {s.level && (
                <span className="text-xs opacity-70">
                  ({s.level.charAt(0) + s.level.slice(1).toLowerCase()})
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setSkillsOffered(skillsOffered.filter((_, idx) => idx !== i))
                }
                className="hover:text-emerald-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a skill (e.g. Python)"
            value={newOfferedName}
            onChange={(e) => setNewOfferedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOfferedSkill();
              }
            }}
            className="flex-1 px-4 py-2 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <select
            value={newOfferedLevel}
            onChange={(e) =>
              setNewOfferedLevel(e.target.value as typeof newOfferedLevel)
            }
            className="px-3 py-2 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0) + l.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addOfferedSkill}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Skills Wanted */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Skills I Want to Learn
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skillsWanted.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-cyan-900/20 text-cyan-400 text-sm px-3 py-1 rounded-full border border-cyan-800/30"
            >
              {s.name}
              {s.level && (
                <span className="text-xs opacity-70">
                  ({s.level.charAt(0) + s.level.slice(1).toLowerCase()})
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setSkillsWanted(skillsWanted.filter((_, idx) => idx !== i))
                }
                className="hover:text-cyan-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a skill (e.g. Guitar)"
            value={newWantedName}
            onChange={(e) => setNewWantedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addWantedSkill();
              }
            }}
            className="flex-1 px-4 py-2 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <select
            value={newWantedLevel}
            onChange={(e) =>
              setNewWantedLevel(e.target.value as typeof newWantedLevel)
            }
            className="px-3 py-2 rounded-xl border border-[#252525] bg-[#242424] text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0) + l.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addWantedSkill}
            className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-[#252525] text-sm font-medium text-gray-200 hover:bg-[#242424] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
