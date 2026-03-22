"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function BrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [skill, setSkill] = useState(searchParams.get("skill") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by skill (e.g. Python, Design)..."
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#444444] bg-[#242424] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Type tabs + clear — inline */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#242424] rounded-lg p-1 border border-[#333333]">
          {[
            { value: "", label: "All" },
            { value: "OFFERED", label: "Teaching" },
            { value: "WANTED", label: "Learning" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                type === tab.value
                  ? "bg-[#333333] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-[#2a2a2a] border border-[#333333] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
