"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X } from "lucide-react";

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
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="e.g. Python, Guitar, Photoshop…"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[#2e2e2e] bg-[#1e1e1e] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {skill && (
          <button
            onClick={() => { setSkill(""); updateParams("", type); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              type === tab.value
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40"
                : "bg-[#242424] text-gray-400 border border-[#2e2e2e] hover:border-indigo-500/30 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {hasFilters && (
          <button
            onClick={handleClear}
            className="ml-auto flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
