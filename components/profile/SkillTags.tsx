import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

interface SkillTagsProps {
  skills: Skill[];
  type: "OFFERED" | "WANTED";
  max?: number;
  size?: "sm" | "md";
}

export default function SkillTags({ skills, type, max, size = "sm" }: SkillTagsProps) {
  const displayed = max ? skills.slice(0, max) : skills;
  const remaining = max && skills.length > max ? skills.length - max : 0;

  if (skills.length === 0) {
    return (
      <span className="text-xs text-gray-500 italic">None added yet</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayed.map((skill) => (
        <span
          key={skill.id}
          className={cn(
            "inline-flex items-center rounded-full font-medium",
            size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1",
            type === "OFFERED"
              ? "bg-emerald-900/20 text-emerald-400 border border-emerald-800/30"
              : "bg-violet-900/20 text-violet-400 border border-violet-800/30"
          )}
        >
          {skill.name}
          {skill.level && (
            <span className={cn(
              "ml-1 opacity-70",
              size === "sm" ? "text-[10px]" : "text-xs"
            )}>
              ({skill.level.charAt(0)}{skill.level.slice(1).toLowerCase()})
            </span>
          )}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full font-medium bg-[#1f1f1f] text-gray-400 border border-[#252525]",
            size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"
          )}
        >
          +{remaining} more
        </span>
      )}
    </div>
  );
}
