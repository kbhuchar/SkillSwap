"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function BrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [skill, setSkill] = useState(searchParams.get("skill") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");

  // Debounce skill input
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

  const hasFilters = skill || type;

  return (
    <div className="bg-[#242424] rounded-2xl border border-[#333333] p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by skill name (e.g. Python, Design)..."
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#444444] bg-[#2e2e2e] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-xl p-1 border border-[#333333]">
            <button
              onClick={() => handleTypeChange("")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !type
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange("OFFERED")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                type === "OFFERED"
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              Teaching
            </button>
            <button
              onClick={() => handleTypeChange("WANTED")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                type === "WANTED"
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              Learning
            </button>
          </div>

          {hasFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-200 px-3 py-2 rounded-xl hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[#333333]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500">Filtered by: </span>
          {skill && (
            <span className="bg-indigo-900/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium border border-indigo-800/30">
              Skill: {skill}
            </span>
          )}
          {type && (
            <span className="bg-purple-900/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium border border-purple-800/30">
              {type === "OFFERED" ? "Teaching" : "Learning"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
