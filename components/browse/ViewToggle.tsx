"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, Rows3 } from "lucide-react";

interface ViewToggleProps {
  view: "grid" | "feed";
}

export default function ViewToggle({ view }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchTo = (newView: "grid" | "feed") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "grid") params.delete("view");
    else params.set("view", "feed");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center bg-[#181818] border border-[#252525] rounded-xl p-1 gap-0.5">
      <button
        onClick={() => switchTo("grid")}
        className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#555] hover:text-[#888]"}`}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => switchTo("feed")}
        className={`p-1.5 rounded-lg transition-colors ${view === "feed" ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#555] hover:text-[#888]"}`}
      >
        <Rows3 className="w-4 h-4" />
      </button>
    </div>
  );
}
