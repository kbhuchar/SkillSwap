"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

const TYPE_TABS = [
  { value: "", label: "Everyone" },
  { value: "OFFERED", label: "Teaching" },
  { value: "WANTED", label: "Learning" },
];

export default function BrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [skill, setSkill] = useState(searchParams.get("skill") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams(skill, type);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  const updateParams = useCallback(
    (skillVal: string, typeVal: string) => {
      const params = new URLSearchParams();
      if (skillVal) params.set("skill", skillVal);
      if (typeVal) params.set("type", typeVal);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateParams(skill, newType);
  };

  const handleClear = () => {
    setSkill("");
    setType("");
    router.push(pathname);
  };

  const activeFilterCount = (skill ? 1 : 0) + (type ? 1 : 0);

  return (
    <div className="sticky top-16 z-20 bg-[#0d0d0d] py-3 -mx-4 sm:-mx-5 px-4 sm:px-5 border-b border-[#252525]/60 animate-fade-up-2">
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${
              focused ? "text-violet-400" : "text-[#888]"
            }`}
          />
          <input
            type="text"
            placeholder="Search by skill — Python, Guitar, Design…"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border bg-[#111111] text-[#e5e5e5] text-sm placeholder:text-[#555] focus:outline-none transition-all duration-200 border-[#252525] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
          />
          {skill && (
            <button
              onClick={() => { setSkill(""); updateParams("", type); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#555] hover:text-[#e5e5e5] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[#888]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>

          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                type === tab.value
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-900/40"
                  : "bg-[#181818] text-[#888] border border-[#252525] hover:border-violet-500/30 hover:text-[#e5e5e5]"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="ml-auto flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e5e5e5] transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
              <span className="w-4 h-4 rounded-full bg-violet-600/20 text-violet-400 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
